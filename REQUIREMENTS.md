# スクール返信アプリ 要件定義書

## 1. プロジェクト概要

### 1.1 目的
講師の対応比率を現在の80%から30%以下に引き下げ、講師以外のスタッフが効率的に質問に返信できるシステムを構築する。

### 1.2 背景
- 現在、返信用スタッフが1名のみ
- 講師が約80%の質問に対応している
- 1つ目のLINEアカウント（質問用）は既に運用中で、WEBアプリとの連携は未実装

### 1.3 成功指標（KPI）
- **KGI**: 講師の対応比率を 80% → 30%以下
- **KPI**:
  - スタッフ対応率（スタッフが一次返信した割合）
  - 平均初回返信時間（SLA: 24時間以内を目標）
  - エスカレーション率（講師に回した割合）
  - 返信のやり直し率（講師が修正した割合）

## 2. システム構成

### 2.1 LINEアカウント構成

#### アカウントA（質問用アカウント）
- **役割**: 受講生からの質問受付
- **ユーザー**: 受講生
- **データ保存先**: `customers` テーブル
- **Webhook URL**: `/api/webhooks2`
- **環境変数**: `LINE_CHANNEL_ACCESS_TOKEN2`, `LINE_CHANNEL_SECRET2`

#### アカウントB（返信用アカウント）
- **役割**: 運営/スタッフの返信管理画面への入口
- **ユーザー**: 運営/スタッフ/講師
- **データ保存先**: `users` テーブル
- **Webhook URL**: `/api/webhooks`
- **環境変数**: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`

### 2.2 アーキテクチャ
```
受講生 → アカウントA（質問送信）
         ↓ Webhook
        DB保存（質問チケット作成）
         ↓
      アカウントB（リッチメニュー）
         ↓ LIFF起動
      返信管理画面（LIFF）
         ↓ テンプレ選択・編集
       アカウントA（Messaging API）
         ↓ Push/Reply
      受講生へ返信
```

## 3. 機能要件

### 3.1 アカウントA側（質問受付）

#### 3.1.1 質問受付
- [x] 受講生からのメッセージ受信（Webhook）
- [x] メッセージ種別対応：
  - テキスト（必須）
  - 画像（優先度高）- messageIdからコンテンツ取得APIでダウンロード→Storage保存→署名URLを保存
  - ファイル（優先度中・MVP後）- 同上
  - スタンプ（任意）
- [x] 質問チケットの自動作成
  - ステータス: `unreplied`（未返信）
  - 受講生情報の自動保存
- [x] ユーザー識別
  - LINE userId（アカウントA）を主キーとして管理（`customers.line_user_id`）
  - 表示名/アイコンをプロフィールから取得して保存
- [x] 添付ファイル処理
  - **重要**: LINEの画像/ファイルはWebhookでURLが直接来ない
  - messageIdを保存し、サーバ側でコンテンツ取得APIを呼び出し
  - Supabase Storage等に保存後、署名付きURLをcontent_urlに格納

#### 3.1.2 返信送信
- [ ] 運営画面からの返信を受け取り、アカウントAのトークンで **push message** 送信
  - **重要**: replyTokenは短時間で期限切れになるため、後から返信する運用では push message のみを使用
  - reply は即時自動応答用途に限定
- [ ] 返信失敗時のリトライ/エラーログ
- [ ] 返信履歴の保存
- [ ] 返信送信とステータス更新をトランザクションで保証（失敗時はrepliesにfailログのみ）

### 3.2 アカウントB側（返信管理）

#### 3.2.1 リッチメニュー
- [ ] リッチメニュー設定
- [ ] タップで LIFF URL を開く
- [ ] 開発URL: `https://liff.line.me/your-liff-id`
- [ ] 本番URL: `https://your-domain.com/liff/inbox`

#### 3.2.2 認証・認可
- [ ] LINEログイン（LIFF）で運営の userId を取得
  - **重要**: LIFFで取得するuserIdはアカウントBのもの（`users.line_user_id`）
  - フロントでIDトークン/アクセストークンをサーバへ送信
  - サーバ側でIDトークンを検証（署名検証）
  - 検証後、`users`テーブルと紐付け
- [ ] 許可リスト照合（役割別アクセス制御・RBAC）
  - **スタッフ**: 未返信閲覧、テンプレ返信、担当割当、エスカレーション作成
  - **講師**: 全閲覧、最終回答、テンプレ/ナレッジ承認
  - **管理者**: メンバー管理、テンプレ管理、運用設定
- [ ] APIは全てログイン済み前提（認証ミドルウェアでトークン検証）

#### 3.2.3 未返信管理画面（必須）

**一覧画面**
- [ ] 未返信数のサマリ（今日/全体）
- [ ] 受講生名 + 最新質問の冒頭 + 経過時間（例：3時間前）
- [ ] フィルタ機能：
  - 未返信 / 返信中 / 保留 / 講師待ち
  - 未割当
  - 期限超過（SLA超過）
  - カテゴリ

**詳細画面**
- [ ] 左：質問履歴（スレッド表示、添付のURL）
  - **重要**: 履歴の定義
    - **案A（推奨）**: `question_messages`テーブルを追加し、受講生の連投・補足を履歴として格納
    - **案B（MVP簡易版）**: 同一customerの直近N件questionsを時系列に並べる
- [ ] 右：返信エディタ（モバイルならタブ切替でもOK）
- [ ] 受講生情報（名前、userId、最終質問日時）
- [ ] ステータス表示：未返信 / 返信中 / 返信済 / 保留

#### 3.2.4 仕分け機能（トリアージ）

**カテゴリ分類**
- [ ] 質問ごとにカテゴリを設定
  - 課題/技術質問/事務連絡/受講ルール/添削依頼/不具合/その他
- [ ] 難易度/自信度（スタッフが回答できる/微妙/講師必須）
- [ ] 期限（SLA: 24h以内など）
- [ ] 担当者割当（未割当をなくす）

#### 3.2.5 テンプレ返信機能（必須）

**テンプレ選択**
- [ ] カテゴリ/キーワードで検索（「不具合」「提出」「期限」など）
- [ ] テンプレ選択 → 本文プレビュー → 編集可能
- [ ] 変数差し込み（例：{name} {question_summary} {next_action}）
- [ ] よく使うテンプレのピン留め

**テンプレ内容**
- [ ] 想定パターン（よくある質問）
- [ ] 確認事項チェックリスト（返信前に聞くべき情報）
- [ ] 差し込み変数（受講生名、講座名、提出物URLなど）
- [ ] 禁則/注意（講師確認が必要なケース）

**送信機能**
- [ ] 送信ボタン、保留ボタン
- [ ] 送信後：テンプレID、編集後本文、送信者、送信時刻を保存
- [ ] **二重返信防止（重要）**
  - DBレベルで担保（UIだけだと競合する）
  - **実装方式**: `questions`テーブルに`lock_version`（int）を持たせる楽観ロック
  - または: `status = replying`に更新するとき条件付きupdate（`WHERE status = unreplied`）でロック相当
- [ ] 返信済みになったらボタン無効化/警告表示

#### 3.2.6 エスカレーション機能（重要）

- [ ] 「講師に相談」ボタン
- [ ] 理由選択（判断が必要 / 添削 / 仕様確認 / 個別事情 / クレーム）
- [ ] 受講生への一次返信テンプレ（例：「確認して折り返します」）も同時送信可
- [ ] 講師側には「質問内容＋スタッフの要約＋論点＋不足情報」がまとまって届く
- [ ] エスカレーション状態の表示（講師待ちタブ）

#### 3.2.7 品質担保機能

**内部メモ**
- [ ] 受講生には見えない内部メモ機能
- [ ] 返信前の確認事項、対応履歴の記録

**承認フロー（任意）**
- [ ] リスクが高いカテゴリだけ「送信前に講師承認」
- [ ] それ以外はスタッフが即送信

**返信ガイドライン**
- [ ] トーン、NG表現、対応範囲、返信テンプレの使い方

#### 3.2.8 テンプレ管理（MVP後）

- [ ] テンプレCRUD（作成/編集/無効化）
- [ ] カテゴリ管理
- [ ] よく使うテンプレのピン留め
- [ ] 署名（運営名）自動付与

#### 3.2.9 ナレッジ化（V2以降）

- [ ] 返信ログから「よくある質問」を抽出
- [ ] 「講師が回答した内容」はワンクリックでテンプレ候補として保存

## 4. データベース設計

### 4.1 テーブル構成

#### 4.1.1 `customers` テーブル（既存・受講生）
```sql
- id: UUID（主キー）
- line_user_id: TEXT（ユニーク、LINE ユーザーID）
- name: TEXT（表示名）
- profile_image_url: TEXT（プロフィール画像URL）
- created_at: TIMESTAMP
- last_accessed_at: TIMESTAMP
```

#### 4.1.2 `users` テーブル（既存・運営）
```sql
- id: UUID（主キー）
- line_user_id: TEXT（ユニーク、LINE ユーザーID）
- name: TEXT（表示名）
- profile_image_url: TEXT（プロフィール画像URL）
- role: TEXT（staff / teacher / admin）
- created_at: TIMESTAMP
- last_accessed_at: TIMESTAMP
```

#### 4.1.3 `questions` テーブル（新規）
```sql
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  line_message_id TEXT, -- LINEのmessageId（コンテンツ取得用）
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'file', 'sticker', 'video', 'audio')),
  content_text TEXT, -- textの場合は本文
  content_url TEXT, -- 添付がある場合のURL（Storage署名URL）
  category TEXT CHECK (category IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他')),
  difficulty TEXT CHECK (difficulty IN ('staff_can_reply', 'unsure', 'teacher_required')),
  status TEXT NOT NULL DEFAULT 'unreplied' CHECK (status IN ('unreplied', 'replying', 'replied', 'on_hold', 'escalated')),
  assigned_to UUID REFERENCES users(id), -- 担当者
  sla_deadline TIMESTAMP WITH TIME ZONE, -- SLA期限
  lock_version INTEGER NOT NULL DEFAULT 0, -- 楽観ロック用
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

CREATE INDEX questions_customer_id_idx ON public.questions(customer_id);
CREATE INDEX questions_status_idx ON public.questions(status);
CREATE INDEX questions_assigned_to_idx ON public.questions(assigned_to);
CREATE INDEX questions_created_at_idx ON public.questions(created_at DESC);
CREATE INDEX questions_category_idx ON public.questions(category) WHERE category IS NOT NULL;

-- updated_at自動更新トリガー
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4.1.3.1 `question_messages` テーブル（新規・履歴用・推奨）
```sql
CREATE TABLE public.question_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  line_message_id TEXT NOT NULL, -- LINEのmessageId
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'file', 'sticker', 'video', 'audio')),
  content_text TEXT,
  content_url TEXT, -- Storage署名URL
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')), -- 送信者種別
  sender_id UUID, -- customer_id または user_id
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT question_messages_pkey PRIMARY KEY (id)
);

CREATE INDEX question_messages_question_id_idx ON public.question_messages(question_id);
CREATE INDEX question_messages_created_at_idx ON public.question_messages(created_at DESC);
```

**履歴の扱い**
- 受講生の連投・補足は`question_messages`に格納
- 質問チケット（`questions`）とメッセージ履歴（`question_messages`）で履歴を表現
- MVP簡易版では、同一customerの直近N件questionsを時系列表示でも可

#### 4.1.4 `replies` テーブル（新規）
```sql
CREATE TABLE public.replies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES users(id), -- 返信者（アカウントBのuserId）
  template_id UUID REFERENCES templates(id), -- 使用したテンプレ
  reply_text TEXT NOT NULL, -- 送信した本文
  original_template_text TEXT, -- テンプレ原文（編集前）
  send_result TEXT NOT NULL DEFAULT 'pending' CHECK (send_result IN ('pending', 'success', 'fail')),
  error_message TEXT, -- 失敗時のエラーメッセージ
  sent_at TIMESTAMP WITH TIME ZONE, -- 実際に送信した時刻（成功時のみ）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT replies_pkey PRIMARY KEY (id)
);

CREATE INDEX replies_question_id_idx ON public.replies(question_id);
CREATE INDEX replies_admin_user_id_idx ON public.replies(admin_user_id);
CREATE INDEX replies_send_result_idx ON public.replies(send_result);
```

#### 4.1.5 `escalations` テーブル（新規）
```sql
CREATE TABLE public.escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  escalated_by UUID NOT NULL REFERENCES users(id), -- エスカレーションした人（アカウントBのuserId）
  escalated_to UUID REFERENCES users(id), -- 講師（担当者・アカウントBのuserId）
  reason TEXT NOT NULL, -- 理由
  staff_summary TEXT, -- スタッフの要約
  points TEXT, -- 論点
  missing_info TEXT, -- 不足情報
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  first_reply_sent BOOLEAN DEFAULT false, -- 一次返信（確認中テンプレ）を送信したか
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT escalations_pkey PRIMARY KEY (id)
);

CREATE INDEX escalations_question_id_idx ON public.escalations(question_id);
CREATE INDEX escalations_status_idx ON public.escalations(status);
CREATE INDEX escalations_escalated_to_idx ON public.escalations(escalated_to) WHERE escalated_to IS NOT NULL;
```

**escalationsとquestionsの整合**
- `questions.status = escalated` と `escalations.status = pending` の組み合わせを保つ
- エスカレーション作成時: `questions.status`を`escalated`に更新（更新責務を明確化）
- エスカレーション解決時: `questions.status`を`replied`または`on_hold`に更新

#### 4.1.6 `templates` テーブル（新規）
```sql
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他')),
  title TEXT NOT NULL, -- テンプレタイトル
  content TEXT NOT NULL, -- テンプレ本文（変数含む）
  variables JSONB DEFAULT '[]'::jsonb, -- 使用可能な変数一覧
  check_list JSONB DEFAULT '[]'::jsonb, -- 確認事項チェックリスト
  notes TEXT, -- 注意事項
  is_pinned BOOLEAN DEFAULT false, -- ピン留め
  is_active BOOLEAN DEFAULT true, -- 有効/無効
  requires_approval BOOLEAN DEFAULT false, -- 講師承認が必要か
  created_by UUID REFERENCES users(id), -- 作成者（アカウントBのuserId）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT templates_pkey PRIMARY KEY (id)
);

CREATE INDEX templates_category_idx ON public.templates(category);
CREATE INDEX templates_is_active_idx ON public.templates(is_active);

-- updated_at自動更新トリガー
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4.1.7 `question_notes` テーブル（新規・内部メモ）
```sql
CREATE TABLE public.question_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id),
  user_id UUID NOT NULL REFERENCES users(id), -- メモ作成者
  note_text TEXT NOT NULL, -- メモ内容
  created_at TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT question_notes_pkey PRIMARY KEY (id)
);

CREATE INDEX question_notes_question_id_idx ON public.question_notes(question_id);
```

## 5. 画面設計（LIFFアプリ）

### 5.1 画面構成

#### 5.1.1 受信箱（Inbox） - `/liff/inbox`
- 未返信 / 返信中 / 保留 / 講師待ち のタブ
- 未返信数のサマリ（今日/全体）
- リスト表示：
  - 受講生名 + 最新質問の冒頭 + 経過時間
  - カテゴリバッジ
  - 担当者
  - SLA期限表示（期限超過は赤表示）

#### 5.1.2 質問詳細 - `/liff/thread/:questionId`

**左側（質問履歴）**
- 受講生情報（名前、アイコン、userId）
- 質問履歴（時系列、スレッド表示）
- 添付ファイルの表示・ダウンロード
- 内部メモ表示

**右側（返信エディタ）**
- ステータス表示
- カテゴリ・担当者の設定
- テンプレ選択ドロップダウン
- 本文エディタ（プレビュー機能）
- 変数自動差し込み
- 確認事項チェックリスト
- 送信ボタン、保留ボタン、エスカレーションボタン

**下側（内部メモ・エスカレーション）**
- 内部メモ入力・表示
- エスカレーション作成フォーム

#### 5.1.3 テンプレ管理 - `/liff/templates`（MVP後）
- テンプレ一覧
- 作成/編集/削除
- カテゴリ管理

## 6. API設計

### 6.1 Webhook API

#### `/api/webhooks2` (POST) - アカウントA（質問受付）
- 受講生からのメッセージ受信
- 質問チケット作成
- レスポンス: 200 OK

### 6.2 LIFF API（Next.js API Routes）

#### `/api/questions` (GET)
- 未返信一覧取得
- Query Parameters:
  - `status`: unreplied/replying/replied/on_hold/escalated
  - `assigned_to`: user_id
  - `category`: カテゴリ
- レスポンス: 質問一覧 + メタデータ
  - **追加フィールド**: `latest_message_at`（表示用、created_atとは別でもOK）

#### `/api/questions/:id` (GET)
- 質問詳細取得
- レスポンス: 質問 + 履歴 + メモ

#### `/api/questions/:id/reply` (POST)
- **返信送信（push messageのみ）**
- Body: `{ templateId?, replyText, variables? }`
- 処理フロー:
  1. 楽観ロックチェック（lock_version確認）
  2. statusを`replying`に更新（条件: `WHERE status = unreplied`）
  3. アカウントAのトークンでpush message送信
  4. 送信成功時: `replies`にsuccess記録、`questions.status`を`replied`に更新
  5. 送信失敗時: `replies`にfail記録のみ（トランザクション保証）
- レスポンス: 送信結果

#### `/api/questions/:id/escalate` (POST)
- エスカレーション作成
- Body: `{ reason, staffSummary, points, missingInfo, sendFirstReply }`
- レスポンス: エスカレーションID

#### `/api/questions/:id/assign` (PUT)
- 担当者割当
- Body: `{ assignedTo }`
- 処理: "未割当→割当"のときだけ更新可能など、競合に強い仕様
- レスポンス: 更新結果

#### `/api/questions/:id/status` (PUT)
- ステータス更新
- Body: `{ status }`
- レスポンス: 更新結果

#### `/api/questions/:id/notes` (POST)
- 内部メモ追加
- Body: `{ noteText }`
- レスポンス: メモID

#### `/api/templates` (GET)
- テンプレ一覧取得
- Query Parameters: `category`, `isActive`
- レスポンス: テンプレ一覧

#### `/api/templates/:id` (GET)
- テンプレ詳細取得
- レスポンス: テンプレ詳細

## 7. 実装フェーズ

### 7.1 MVP（Phase 1）- 最短で動かす（優先順位順）
1. [x] データベーステーブル作成（questions, replies, escalations, templates）
2. [x] アカウントAのWebhook受信・DB保存（質問受付）
3. [ ] アカウントBのリッチメニュー設定
4. [ ] LIFF認証（IDトークン検証）
5. [ ] 未返信一覧表示
6. [ ] 質問詳細表示
7. [ ] **担当割当機能**
8. [ ] テンプレ選択・編集・送信
9. [ ] **アカウントA経由でpush message送信**（replyではなくpush）
10. [ ] ステータス更新（返信済み）
11. [ ] **エスカレーション機能**（一次返信「確認します」も同時送信）
12. [ ] **画像保存**（messageId→Storage→署名URL）

**MVP完了基準**
- 受講生が質問を送信するとDBに保存される
- スタッフがLIFF画面で未返信一覧を見られる
- 担当者を割り当てられる
- テンプレを選択して返信を送信できる（push message）
- エスカレーションが作成できる（一次返信も送信）
- 返信後、ステータスが更新される
- 画像が表示できる

### 7.2 Phase 2 - 運用強化
- [ ] カテゴリ分類（フィルタ・集計）
- [ ] SLA管理・期限表示（アラート）
- [ ] 内部メモ
- [ ] テンプレ管理画面（CRUD）
- [ ] 検索・フィルタ強化
- [ ] ファイル添付対応
- [ ] question_messagesテーブル導入（履歴の充実化）

### 7.3 Phase 3 - 高度な機能
- [ ] 承認フロー
- [ ] 分析ダッシュボード（対応率、平均時間など）
- [ ] ナレッジ化（講師回答→テンプレ化）
- [ ] Slack通知連携
- [ ] 返信品質分析

## 8. セキュリティ要件

### 8.1 認証・認可
- **LIFF認証の具体実装**:
  - フロントでLIFF SDKからIDトークン/アクセストークンを取得
  - サーバへトークンを送信（Authorizationヘッダーなど）
  - サーバ側でIDトークンを検証（署名検証・有効期限確認）
  - 検証成功後、`users`テーブルと紐付け（`line_user_id`で照合）
  - 認証ミドルウェアで全APIを保護
- 役割ベースのアクセス制御（RBAC）
- 許可リストによる運営アクセス制限
- **重要**: スタッフがBでログインして取得するuserIdはアカウントBのもの（`users.line_user_id`はBで統一）

### 8.2 データ保護
- アクセストークンはサーバー側で暗号化保管
- 個人情報の暗号化
- 監査ログ（誰がいつ何を送ったか）

### 8.3 データ保持
- 質問ログの保持期間: 6〜12ヶ月（要件化が必要）
- 削除ポリシーの明確化

## 9. 例外処理・エッジケース

### 9.1 同時編集対策
- 返信中ロック（楽観ロック）
- 更新競合時の検知と警告

### 9.2 返信失敗時の処理
- リトライ機能
- エラーログ記録
- 管理者通知

### 9.3 質問の連投
- 1質問 = 1チケット（スレッド化はV2以降）

### 9.4 添付ファイル
- MVP: 画像対応優先
  - LINEのmessageIdからコンテンツ取得APIを呼び出し
  - Supabase Storageに保存
  - 署名付きURLを`content_url`に格納
- ファイル対応はPhase 2以降

## 10. 運用・保守

### 10.1 監視
- Webhook受信ログ
- 返信送信ログ
- エラーログ
- パフォーマンス監視

### 10.2 バックアップ
- データベースの定期バックアップ
- ログの保存

### 10.3 ドキュメント
- 運営マニュアル
- テンプレ作成ガイド
- トラブルシューティング

