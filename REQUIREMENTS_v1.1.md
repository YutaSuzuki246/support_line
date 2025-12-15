# 要件定義書 v1.1（改訂版）

## 改訂履歴

- **v1.1** (2024-12-15): レビューコメントを反映
  - push message前提に統一
  - 添付ファイル処理の明確化（messageId→Storage→署名URL）
  - 履歴テーブル（question_messages）追加
  - LIFF認証の具体化（IDトークン検証）
  - DB制約の強化（CHECK制約、楽観ロック）
  - escalationsとquestionsの整合性を明確化

## 重要な設計決定

### 1. 返信方式: push message のみ
- **理由**: replyTokenは短時間で期限切れになるため、後から返信する運用では push message のみを使用
- **実装**: `/api/questions/:id/reply` は push のみ

### 2. 添付ファイル処理
- LINEの画像/ファイルはWebhookでURLが直接来ない
- フロー: messageId保存 → コンテンツ取得API呼び出し → Storage保存 → 署名URLをcontent_urlに格納

### 3. 履歴の定義
- **推奨**: `question_messages`テーブルで履歴を管理
- **MVP簡易版**: 同一customerの直近N件questionsを時系列表示

### 4. userIdの扱い
- **アカウントA**: `customers.line_user_id`（受講生）
- **アカウントB**: `users.line_user_id`（運営・スタッフ・講師）
- LIFF認証で取得するuserIdはアカウントBのもの

### 5. 認証方式
- LIFFでIDトークンを取得
- サーバ側でIDトークンを検証（署名検証・有効期限確認）
- `users`テーブルと紐付け

### 6. 二重返信防止
- DBレベルで楽観ロック（`lock_version`）を実装
- または条件付きupdate（`WHERE status = unreplied`）

---

詳細は `REQUIREMENTS.md` を参照してください。

