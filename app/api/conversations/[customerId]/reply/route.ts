import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyLiffToken } from "@/lib/auth/liff";
import { getConversationByCustomerId } from "@/lib/db/conversations";
import { createQuestionMessage } from "@/lib/db/questionMessages";
import { updateQuestion } from "@/lib/db/questions";
import {
  createReply,
  markReplyAsFailed,
  markReplyAsSuccess,
} from "@/lib/db/replies";
import { getUserByLineUserId } from "@/lib/db/users";

const LINE_CHANNEL_ACCESS_TOKEN2 = process.env.LINE_CHANNEL_ACCESS_TOKEN2!; // アカウント2（質問用）のトークンでpush送信

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    // LIFF認証
    const { userId: lineUserId, error: authError } = await verifyLiffToken(req);
    if (authError || !lineUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザー情報を取得
    const { data: user } = await getUserByLineUserId(lineUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const customerId = params.customerId;
    const body = await req.json();
    const { replyText, templateId, originalTemplateText, questionId } = body;

    if (!replyText) {
      return NextResponse.json(
        { error: "replyText is required" },
        { status: 400 }
      );
    }

    // customer情報と未返信質問を取得
    const conversation = await getConversationByCustomerId(customerId);
    if (conversation.error || !conversation.data) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const customer = conversation.data.customer;
    const unrepliedQuestions = conversation.data.unreplied_questions || [];

    // 返信対象のquestion_idを決定
    // 1. questionIdが指定されていればそれを使用
    // 2. 未返信質問があれば、最も古いものを使用
    // 3. どちらもなければ、新しいquestionを作成
    let targetQuestionId: string;
    if (questionId) {
      targetQuestionId = questionId;
    } else if (unrepliedQuestions.length > 0) {
      // 最も古い未返信質問を使用
      targetQuestionId = unrepliedQuestions[unrepliedQuestions.length - 1].id;
    } else {
      // 新しいquestionを作成（会話継続のため）
      const { createQuestion } = await import("@/lib/db/questions");
      const newQuestion = await createQuestion({
        customer_id: customerId,
        content_type: "text",
        status: "replied", // 返信と同時にrepliedにする
      });
      if (newQuestion.error || !newQuestion.data) {
        return NextResponse.json(
          { error: "Failed to create question" },
          { status: 500 }
        );
      }
      targetQuestionId = newQuestion.data.id;
    }

    // 返信レコードを作成（送信前に作成）
    const reply = await createReply({
      question_id: targetQuestionId,
      admin_user_id: user.id,
      template_id: templateId || null,
      reply_text: replyText,
      original_template_text: originalTemplateText || null,
      send_result: "pending",
    });

    if (reply.error) {
      return NextResponse.json(
        { error: "Failed to create reply record" },
        { status: 500 }
      );
    }

    const replyId = reply.data!.id;

    // LINE Messaging APIでpush message送信
    try {
      const customerLineUserId = customer.line_user_id;

      if (!customerLineUserId) {
        throw new Error("Customer line_user_id not found");
      }

      // LINE Messaging APIでpush message送信
      const pushRes = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN2}`,
        },
        body: JSON.stringify({
          to: customerLineUserId,
          messages: [
            {
              type: "text",
              text: replyText,
            },
          ],
        }),
      });

      if (!pushRes.ok) {
        const errorText = await pushRes.text();
        console.error("Push message failed:", errorText);

        // 失敗を記録
        await markReplyAsFailed(replyId, errorText);

        return NextResponse.json(
          { error: "Failed to send reply", details: errorText },
          { status: 500 }
        );
      }

      // 成功を記録
      await markReplyAsSuccess(replyId);

      // question_messagesにも返信を保存
      await createQuestionMessage({
        question_id: targetQuestionId,
        line_message_id: randomUUID(), // 返信にはLINE messageIdがないためUUIDを使用
        content_type: "text",
        content_text: replyText,
        sender_type: "admin",
        customer_id: null,
        admin_user_id: user.id,
      });

      // 質問のステータスを'replied'に更新
      if (unrepliedQuestions.some((q) => q.id === targetQuestionId)) {
        await updateQuestion(targetQuestionId, { status: "replied" });
      }

      return NextResponse.json({
        success: true,
        reply: reply.data,
      });
    } catch (error: any) {
      console.error("Reply send error:", error);

      // 失敗を記録
      await markReplyAsFailed(replyId, error.message || "Unknown error");

      return NextResponse.json(
        { error: "Failed to send reply", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

