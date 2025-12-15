# 会話ベース表示への変更要件 v2

## 問題点と課題

### 1. 現在の問題

1. **自分が送ったメッセージが表示されない**
   - 返信メッセージを`question_messages`に保存しているが、取得時に表示されていない
   - `getConversationByCustomerId`で`customer_id`でフィルタしているため、`admin_user_id`のみのメッセージが取得できていない可能性

2. **未返信質問数の表示が不正確**
   - 複数の質問メッセージがある場合、返信しても「○件の未返信質問」と表示される
   - `questions`テーブルのstatusを個別に管理しているため、customer単位での状態把握が難しい

3. **状態管理の設計**
   - 現在は`questions`テーブルでstatus管理（unreplied/replied等）
   - customer単位で「最後に返信した時刻」を把握したい
   - customer全体の「未返信があるかどうか」を簡単に判断したい

## 要件

### 1. データベース変更

#### customersテーブルにカラムを追加

```sql
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS has_unreplied_messages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_admin_reply_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMPTZ;
```

**カラム説明：**
- `has_unreplied_messages`: customerに未返信メッセージがあるか（boolean）
- `last_admin_reply_at`: 最後に運営が返信した時刻
- `last_customer_message_at`: 最後に受講生がメッセージを送った時刻

**更新タイミング：**
- 受講生がメッセージを送った時：`last_customer_message_at`を更新、`has_unreplied_messages`を`true`に
- 運営が返信した時：`last_admin_reply_at`を更新、`has_unreplied_messages`を`false`に

#### インデックス追加

```sql
CREATE INDEX IF NOT EXISTS customers_has_unreplied_messages_idx 
ON public.customers(has_unreplied_messages) 
WHERE has_unreplied_messages = true;

CREATE INDEX IF NOT EXISTS customers_last_customer_message_at_idx 
ON public.customers(last_customer_message_at DESC);
```

### 2. メッセージ取得ロジックの修正

#### `getConversationByCustomerId`の修正

現在の問題：
- `customer_id`でフィルタしているため、`sender_type='admin'`のメッセージが取得できない

修正方法：
- `customer_id`が一致する、または`question_messages`に関連する`questions.customer_id`が一致するメッセージを取得
- または、`question_id`を介してcustomerに関連するメッセージを取得

**推奨実装：**
```sql
SELECT qm.*
FROM question_messages qm
JOIN questions q ON qm.question_id = q.id
WHERE q.customer_id = :customerId
ORDER BY qm.created_at ASC;
```

これにより、customerに関連する全てのメッセージ（受講生と運営の両方）を取得できる。

### 3. 未返信状態の判定ロジック

#### 未返信の定義

- `last_customer_message_at > last_admin_reply_at` の場合、未返信と判定
- または `last_customer_message_at` が存在し、`last_admin_reply_at` が null またはより古い場合

#### 未返信数の計算

- `questions`テーブルの`status='unreplied'`の数を数えるのではなく
- customerの`has_unreplied_messages`フラグを使用
- より詳細にしたい場合は、最後のcustomerメッセージ以降にadminメッセージがないことを確認

### 4. 返信処理の変更

#### 返信時の処理フロー

1. 返信メッセージを`question_messages`に保存（`sender_type='admin'`）
2. `replies`テーブルに返信履歴を保存
3. **customersテーブルを更新：**
   - `last_admin_reply_at = now()`
   - `has_unreplied_messages = false`
4. LINE push messageで送信
5. 成功時、必要に応じて`questions`テーブルも更新（ステータス管理用）

#### questionsテーブルの扱い

- `questions`テーブルは**履歴・分析用**として残す
- ステータス管理は`customers`テーブルで行う
- `questions.status`の更新は任意（分析用データとして保持）

### 5. メッセージ受信時の処理（Webhook）

#### `webhooks2`の修正

受講生がメッセージを送った時：
1. `question_messages`に保存（既存）
2. `questions`に保存（既存）
3. **customersテーブルを更新：**
   - `last_customer_message_at = now()`
   - `has_unreplied_messages = true`

### 6. 会話一覧取得の最適化

#### `getConversations`の修正

`questions`テーブルをJOINして未返信数を数えるのではなく：
- `customers.has_unreplied_messages`を直接使用
- `last_customer_message_at`と`last_admin_reply_at`を比較して判定

これにより、パフォーマンスが向上し、判定ロジックがシンプルになる。

### 7. UI表示の改善

#### 一覧画面

- 未返信数バッジは`has_unreplied_messages`フラグを使用
- 「○件の未返信質問」ではなく、「未返信あり」のような表示に変更
- 最後に返信した時刻：`last_admin_reply_at`を使用
- 最新メッセージ時刻：`last_customer_message_at`を使用

#### 会話画面

- 全会話履歴が正しく表示される（受講生・運営の両方）
- 未返信の表示は、`last_customer_message_at > last_admin_reply_at`で判定

## 実装の優先順位

### Phase 1: 緊急修正
1. **メッセージ取得ロジックの修正**（自分が送ったメッセージが表示されない問題）
   - `getConversationByCustomerId`で`questions`をJOINして取得

2. **customersテーブルにカラム追加**
   - マイグレーションファイル作成

3. **返信処理でcustomersテーブル更新**
   - `last_admin_reply_at`更新
   - `has_unreplied_messages = false`

4. **Webhook処理でcustomersテーブル更新**
   - `last_customer_message_at`更新
   - `has_unreplied_messages = true`

### Phase 2: 機能改善
5. **会話一覧取得の最適化**
   - `getConversations`で`has_unreplied_messages`を使用

6. **UI表示の改善**
   - 未返信数の表示方法を変更

## データ整合性の考慮

### 既存データのマイグレーション

既存のデータに対して：
```sql
-- customersテーブルの初期値を設定
UPDATE customers c
SET 
  last_customer_message_at = (
    SELECT MAX(qm.created_at)
    FROM question_messages qm
    JOIN questions q ON qm.question_id = q.id
    WHERE q.customer_id = c.id
    AND qm.sender_type = 'customer'
  ),
  last_admin_reply_at = (
    SELECT MAX(qm.created_at)
    FROM question_messages qm
    JOIN questions q ON qm.question_id = q.id
    WHERE q.customer_id = c.id
    AND qm.sender_type = 'admin'
  ),
  has_unreplied_messages = (
    CASE 
      WHEN (
        SELECT MAX(qm.created_at)
        FROM question_messages qm
        JOIN questions q ON qm.question_id = q.id
        WHERE q.customer_id = c.id
        AND qm.sender_type = 'customer'
      ) > COALESCE((
        SELECT MAX(qm.created_at)
        FROM question_messages qm
        JOIN questions q ON qm.question_id = q.id
        WHERE q.customer_id = c.id
        AND qm.sender_type = 'admin'
      ), '1970-01-01'::timestamp)
      THEN true
      ELSE false
    END
  );
```

## 注意点

1. **トランザクション管理**
   - 返信処理とcustomersテーブル更新は同一トランザクションで実行

2. **パフォーマンス**
   - インデックスを適切に設定
   - `has_unreplied_messages`フラグでクエリを最適化

3. **データ整合性**
   - Webhook処理と返信処理の両方でcustomersテーブルを更新
   - タイミングのズレを考慮（最終的な整合性を保証）

