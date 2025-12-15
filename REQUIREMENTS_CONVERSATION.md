# 会話ベース表示への変更要件

## 変更の目的

現在の実装では質問チケット単位で表示・返信しているが、LINEのトーク画面のように**受講生（customer）単位**で会話履歴を表示し、その中で返信できるようにする。

## 設計方針

### 1. 画面構成の変更

#### 現在の構成
- 一覧画面：質問チケット（questions）の一覧
- 詳細画面：1つの質問チケットの詳細と返信

#### 変更後の構成
- **一覧画面**：受講生（customer）の一覧
  - 各受講生に対して、最新の未返信質問のプレビュー
  - 未返信数、最新メッセージ時刻を表示
- **会話画面**：受講生との全会話履歴
  - `question_messages`からそのcustomerの全メッセージを時系列で表示
  - 会話の最後に返信フォームを表示
  - 未返信の質問があれば、それを返信対象とする

### 2. データ構造

#### 既存テーブル
- `questions`：質問チケット（ステータス管理用）
- `question_messages`：全メッセージ履歴（会話表示用）
- `customers`：受講生情報

#### データの扱い
- `question_messages`を`customer_id`でグループ化して表示
- 各customerの最新メッセージを取得
- 未返信の`questions`があるcustomerを優先表示

### 3. API設計の変更

#### 新規API

##### `/api/conversations` (GET)
- 受講生（customer）単位の会話一覧を取得
- Query Parameters:
  - `has_unreplied`: 未返信がある受講生のみ（デフォルト: true）
  - `status`: questionsのステータスフィルタ（unreplied/replying/replied/on_hold/escalated）
- レスポンス:
```json
{
  "conversations": [
    {
      "customer": {
        "id": "uuid",
        "name": "受講生名",
        "line_user_id": "U...",
        "profile_image_url": "..."
      },
      "latest_message": {
        "content_text": "最新メッセージ",
        "created_at": "2024-12-15T10:00:00Z",
        "sender_type": "customer"
      },
      "unreplied_count": 2,
      "unreplied_questions": [
        {
          "id": "uuid",
          "content_text": "質問内容",
          "created_at": "2024-12-15T10:00:00Z",
          "status": "unreplied"
        }
      ],
      "last_replied_at": "2024-12-14T15:00:00Z" // 最後に返信した時刻
    }
  ]
}
```

##### `/api/conversations/[customerId]` (GET)
- 特定の受講生との全会話履歴を取得
- レスポンス:
```json
{
  "customer": {
    "id": "uuid",
    "name": "受講生名",
    "line_user_id": "U...",
    "profile_image_url": "..."
  },
  "messages": [
    {
      "id": "uuid",
      "content_text": "メッセージ内容",
      "content_type": "text",
      "content_url": "...",
      "sender_type": "customer",
      "created_at": "2024-12-15T10:00:00Z",
      "customer": {...},
      "admin_user": null
    },
    {
      "id": "uuid",
      "content_text": "返信内容",
      "content_type": "text",
      "sender_type": "admin",
      "created_at": "2024-12-15T11:00:00Z",
      "customer": null,
      "admin_user": {...}
    }
  ],
  "unreplied_questions": [
    {
      "id": "uuid",
      "content_text": "未返信の質問",
      "status": "unreplied",
      "created_at": "2024-12-15T10:00:00Z"
    }
  ]
}
```

##### `/api/conversations/[customerId]/reply` (POST)
- 受講生への返信を送信
- Body:
```json
{
  "replyText": "返信内容",
  "templateId": "uuid (optional)",
  "originalTemplateText": "... (optional)",
  "questionId": "uuid (optional)" // 特定の質問への返信の場合
}
```
- 処理フロー:
  1. 返信メッセージを`question_messages`に保存（sender_type: 'admin'）
  2. 指定された`questionId`があれば、その質問を'replied'に更新
  3. 未返信の`questions`があれば、最も古いものを'replied'に更新
  4. LINE push messageで送信
  5. `replies`テーブルに返信履歴を保存

### 4. 画面設計の変更

#### 一覧画面 (`/liff/inbox`)
- 受講生（customer）のリストを表示
- 各カードに表示する情報：
  - 受講生名・アイコン
  - 最新メッセージのプレビュー（50文字程度）
  - 未返信バッジ（未返信数）
  - 最新メッセージの時刻（「3時間前」など）
  - 最後に返信した時刻（あれば）
- クリックで会話画面に遷移

#### 会話画面 (`/liff/conversation/[customerId]`)
- LINEのトーク画面のような表示
- メッセージの表示：
  - 受講生のメッセージ：左側、青色背景
  - 運営のメッセージ：右側、灰色背景
  - 時系列で表示
- 返信フォーム：
  - 画面下部に固定
  - テンプレート選択
  - 返信本文入力
  - 送信ボタン

### 5. データ取得ロジック

#### 会話一覧の取得
```sql
-- 各customerの最新メッセージと未返信数を取得
SELECT 
  c.*,
  (
    SELECT qm.content_text, qm.created_at, qm.sender_type
    FROM question_messages qm
    WHERE qm.customer_id = c.id
    ORDER BY qm.created_at DESC
    LIMIT 1
  ) as latest_message,
  (
    SELECT COUNT(*)
    FROM questions q
    WHERE q.customer_id = c.id
    AND q.status = 'unreplied'
  ) as unreplied_count
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM question_messages qm WHERE qm.customer_id = c.id
)
ORDER BY (
  SELECT qm.created_at
  FROM question_messages qm
  WHERE qm.customer_id = c.id
  ORDER BY qm.created_at DESC
  LIMIT 1
) DESC;
```

#### 会話履歴の取得
```sql
-- 特定のcustomerとの全メッセージを取得
SELECT qm.*
FROM question_messages qm
WHERE qm.customer_id = :customerId
ORDER BY qm.created_at ASC;
```

### 6. 質問チケット（questions）の扱い

- `questions`テーブルは**ステータス管理**のために残す
- 表示は`question_messages`ベースで行う
- 返信時：
  - 未返信の`questions`があれば、最も古いものを'replied'に更新
  - すべて返信済みの場合は、新しい`question`を作成（オプション）

### 7. 実装の優先順位

#### Phase 1: 基本機能
1. `/api/conversations` API実装
2. `/api/conversations/[customerId]` API実装
3. `/api/conversations/[customerId]/reply` API実装
4. 一覧画面の変更（customer単位表示）
5. 会話画面の実装

#### Phase 2: 機能拡張
- 未返信質問のバッジ表示
- 検索・フィルタ機能
- カテゴリ別表示
- 担当者別表示

## データベース変更

特に変更は不要。既存のテーブル構造で実装可能。

ただし、パフォーマンス向上のために追加できるインデックス：
```sql
CREATE INDEX IF NOT EXISTS question_messages_customer_id_created_at_idx 
ON public.question_messages(customer_id, created_at DESC);
```

## UI/UXの改善ポイント

1. **会話画面の見た目**
   - LINE風のバブル表示
   - 受講生：左側、運営：右側
   - 時刻表示をコンパクトに

2. **一覧画面の改善**
   - 未返信がある受講生を強調表示
   - 最後に返信した時刻を表示（「2日前に返信」など）
   - 未返信数バッジ

3. **返信フォーム**
   - 画面下部に固定（モバイル対応）
   - テンプレート選択を簡単に
   - 送信中のローディング表示

