# データベーステーブル一覧

## 新規作成するテーブル

スクール返信アプリのために、以下の**6つの新規テーブル**を作成します。

---

## 1. `questions` テーブル（質問チケット）

**目的**: 受講生からの質問を管理するメインテーブル

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `customer_id` | UUID | 受講生ID（外部キー） | NOT NULL, REFERENCES customers(id) |
| `line_message_id` | TEXT | LINEのmessageId（コンテンツ取得用） | |
| `content_type` | TEXT | コンテンツ種別 | NOT NULL, CHECK IN ('text', 'image', 'file', 'sticker', 'video', 'audio') |
| `content_text` | TEXT | テキスト本文 | |
| `content_url` | TEXT | 添付ファイルのURL（Storage署名URL） | |
| `category` | TEXT | カテゴリ | CHECK IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他') |
| `difficulty` | TEXT | 難易度/自信度 | CHECK IN ('staff_can_reply', 'unsure', 'teacher_required') |
| `status` | TEXT | ステータス | NOT NULL, DEFAULT 'unreplied', CHECK IN ('unreplied', 'replying', 'replied', 'on_hold', 'escalated') |
| `assigned_to` | UUID | 担当者ID（外部キー） | REFERENCES users(id) |
| `sla_deadline` | TIMESTAMP | SLA期限 | |
| `lock_version` | INTEGER | 楽観ロック用バージョン | NOT NULL, DEFAULT 0 |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMP | 更新日時 | NOT NULL, DEFAULT now() |

### インデックス

- `questions_customer_id_idx` - customer_id
- `questions_status_idx` - status
- `questions_assigned_to_idx` - assigned_to
- `questions_created_at_idx` - created_at (DESC)
- `questions_category_idx` - category (WHERE category IS NOT NULL)

### トリガー

- `update_questions_updated_at` - updated_atを自動更新

---

## 2. `replies` テーブル（返信履歴）

**目的**: スタッフ/講師が送信した返信を記録

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `question_id` | UUID | 質問ID（外部キー） | NOT NULL, REFERENCES questions(id) |
| `admin_user_id` | UUID | 返信者ID（外部キー・アカウントBのuserId） | NOT NULL, REFERENCES users(id) |
| `template_id` | UUID | 使用したテンプレID（外部キー） | REFERENCES templates(id) |
| `reply_text` | TEXT | 送信した本文 | NOT NULL |
| `original_template_text` | TEXT | テンプレ原文（編集前） | |
| `send_result` | TEXT | 送信結果 | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'success', 'fail') |
| `error_message` | TEXT | 失敗時のエラーメッセージ | |
| `sent_at` | TIMESTAMP | 実際に送信した時刻 | |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |

### インデックス

- `replies_question_id_idx` - question_id
- `replies_admin_user_id_idx` - admin_user_id
- `replies_send_result_idx` - send_result

---

## 3. `escalations` テーブル（エスカレーション）

**目的**: スタッフから講師へのエスカレーションを管理

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `question_id` | UUID | 質問ID（外部キー） | NOT NULL, REFERENCES questions(id) |
| `escalated_by` | UUID | エスカレーションした人（外部キー・アカウントBのuserId） | NOT NULL, REFERENCES users(id) |
| `escalated_to` | UUID | 講師（担当者・外部キー・アカウントBのuserId） | REFERENCES users(id) |
| `reason` | TEXT | 理由 | NOT NULL |
| `staff_summary` | TEXT | スタッフの要約 | |
| `points` | TEXT | 論点 | |
| `missing_info` | TEXT | 不足情報 | |
| `status` | TEXT | ステータス | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'in_progress', 'resolved') |
| `first_reply_sent` | BOOLEAN | 一次返信（確認中テンプレ）を送信したか | DEFAULT false |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |
| `resolved_at` | TIMESTAMP | 解決日時 | |

### インデックス

- `escalations_question_id_idx` - question_id
- `escalations_status_idx` - status
- `escalations_escalated_to_idx` - escalated_to (WHERE escalated_to IS NOT NULL)

### 注意点

- `questions.status = 'escalated'` と `escalations.status = 'pending'` の組み合わせを保つ必要がある
- エスカレーション作成時: `questions.status` を `'escalated'` に更新
- エスカレーション解決時: `questions.status` を `'replied'` または `'on_hold'` に更新

---

## 4. `templates` テーブル（テンプレート）

**目的**: 返信テンプレートを管理

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `category` | TEXT | カテゴリ | NOT NULL, CHECK IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他') |
| `title` | TEXT | テンプレタイトル | NOT NULL |
| `content` | TEXT | テンプレ本文（変数含む、例: {name}） | NOT NULL |
| `variables` | JSONB | 使用可能な変数一覧 | DEFAULT '[]'::jsonb |
| `check_list` | JSONB | 確認事項チェックリスト | DEFAULT '[]'::jsonb |
| `notes` | TEXT | 注意事項 | |
| `is_pinned` | BOOLEAN | ピン留め | DEFAULT false |
| `is_active` | BOOLEAN | 有効/無効 | DEFAULT true |
| `requires_approval` | BOOLEAN | 講師承認が必要か | DEFAULT false |
| `created_by` | UUID | 作成者ID（外部キー） | REFERENCES users(id) |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMP | 更新日時 | NOT NULL, DEFAULT now() |

### インデックス

- `templates_category_idx` - category
- `templates_is_active_idx` - is_active

### トリガー

- `update_templates_updated_at` - updated_atを自動更新

---

## 5. `question_notes` テーブル（内部メモ）

**目的**: 質問に関する内部メモ（受講生には見えない）

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `question_id` | UUID | 質問ID（外部キー） | NOT NULL, REFERENCES questions(id) |
| `user_id` | UUID | メモ作成者ID（外部キー） | NOT NULL, REFERENCES users(id) |
| `note_text` | TEXT | メモ内容 | NOT NULL |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |

### インデックス

- `question_notes_question_id_idx` - question_id
- `question_notes_created_at_idx` - created_at (DESC)

---

## 6. `question_messages` テーブル（会話履歴）

**目的**: 質問に関する会話履歴（受講生の連投・補足、返信履歴）

### カラム構成

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| `id` | UUID | 主キー | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `question_id` | UUID | 質問ID（外部キー） | NOT NULL, REFERENCES questions(id) |
| `line_message_id` | TEXT | LINEのmessageId | NOT NULL |
| `content_type` | TEXT | コンテンツ種別 | NOT NULL, CHECK IN ('text', 'image', 'file', 'sticker', 'video', 'audio') |
| `content_text` | TEXT | テキスト本文 | |
| `content_url` | TEXT | 添付ファイルのURL（Storage署名URL） | |
| `sender_type` | TEXT | 送信者種別 | NOT NULL, CHECK IN ('customer', 'admin') |
| `sender_id` | UUID | customer_id または user_id | |
| `created_at` | TIMESTAMP | 作成日時 | NOT NULL, DEFAULT now() |

### インデックス

- `question_messages_question_id_idx` - question_id
- `question_messages_created_at_idx` - created_at (DESC)
- `question_messages_sender_type_idx` - sender_type

---

## 既存テーブルの変更

### `users` テーブルへの追加

- `role` カラムを追加（TEXT, DEFAULT 'staff', CHECK IN ('staff', 'teacher', 'admin')）
  - 運営スタッフの役割を管理（スタッフ / 講師 / 管理者）

---

## テーブル間のリレーション

```
customers (受講生)
  └─< questions (質問)
       ├─< replies (返信)
       ├─< escalations (エスカレーション)
       ├─< question_notes (内部メモ)
       └─< question_messages (会話履歴)

users (運営・スタッフ・講師)
  ├─< questions.assigned_to (担当者)
  ├─< replies.admin_user_id (返信者)
  ├─< escalations.escalated_by (エスカレーションした人)
  ├─< escalations.escalated_to (講師)
  ├─< question_notes.user_id (メモ作成者)
  └─< templates.created_by (テンプレ作成者)

templates (テンプレート)
  └─< replies.template_id (使用したテンプレ)
```

---

## Row Level Security (RLS)

すべての新規テーブルでRLSを有効化しています。

現在は service role がすべての操作を許可するポリシーを設定していますが、将来的には役割ベースのアクセス制御を追加できます。

---

## マイグレーションファイル

以下の順番でマイグレーションを実行してください：

1. `20241215000000_create_customers_table.sql` - customersテーブル（既存）
2. `20241215000001_create_questions_tables.sql` - questions, templates, replies, escalations, question_notes
3. `20241215000002_insert_initial_templates.sql` - 初期テンプレートデータ
4. `20241215000003_create_question_messages.sql` - question_messagesテーブル

