# support_line

Next.js 14 と LINE Messaging API を使った LINE ボットのスターターキット

## 主要機能

- **2つのLINE公式アカウント対応**
  - アカウント1: `users` テーブルで管理（Webhook: `/api/webhooks`）
  - アカウント2: `customers` テーブルで管理（Webhook: `/api/webhooks2`）
- **ユーザー管理**: Supabase でユーザー情報を保存
- **認証**: Supabase Auth、LINE ログイン
- **リッチメニュー管理**: 複数のリッチメニューを作成・切り替え
- **メッセージ応答**: テキスト、画像、動画、イメージマップなど

## 技術スタック

- **フレームワーク**: Next.js 14.1.4
- **UI**: React 18.2.0、Radix UI、Tailwind CSS
- **認証**: Supabase、LINE LIFF
- **データベース**: Supabase (PostgreSQL)
- **LINE API**: @line/liff 2.26.1

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
# または
pnpm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして、必要な値を設定してください。

```bash
cp .env.example .env.local
```

### 3. Supabase のセットアップ

```bash
# Supabase CLI でマイグレーションを実行
npx supabase db push

# または、Supabase ダッシュボードから SQL を実行
# supabase/migrations/ 内の SQL ファイルを順番に実行
```

### 4. 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

## データベース構造

### users テーブル（LINE アカウント1用）

- `id`: UUID（主キー）
- `line_user_id`: LINE ユーザーID（ユニーク）
- `name`: 表示名
- `profile_image_url`: プロフィール画像URL
- `created_at`: 作成日時
- `last_accessed_at`: 最終アクセス日時

### customers テーブル（LINE アカウント2用）

- `id`: UUID（主キー）
- `line_user_id`: LINE ユーザーID（ユニーク）
- `name`: 表示名
- `profile_image_url`: プロフィール画像URL
- `created_at`: 作成日時
- `last_accessed_at`: 最終アクセス日時

## ディレクトリ構造

```
support_line/
├── app/
│   ├── api/
│   │   ├── webhooks/       # LINE アカウント1の Webhook
│   │   └── webhooks2/      # LINE アカウント2の Webhook
│   ├── (auth)/             # 認証関連ページ
│   └── profile/            # プロフィールページ
├── components/
│   ├── line/               # LINE 関連コンポーネント
│   │   ├── SampleReply.tsx       # メッセージ応答処理
│   │   └── SampleRichMenu.tsx    # リッチメニュー管理
│   ├── modules/            # 機能別モジュール
│   └── ui/                 # UI コンポーネント
├── lib/
│   └── db/                 # データベース処理
│       ├── users.ts        # users テーブルの CRUD
│       ├── customers.ts    # customers テーブルの CRUD
│       └── database.types.ts # 型定義
└── supabase/
    └── migrations/         # データベースマイグレーション
```

## LINE Webhook の設定

### アカウント1（users テーブル用）

- Webhook URL: `https://your-domain.com/api/webhooks`
- 環境変数: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`

### アカウント2（customers テーブル用）

- Webhook URL: `https://your-domain.com/api/webhooks2`
- 環境変数: `LINE_CHANNEL_ACCESS_TOKEN2`, `LINE_CHANNEL_SECRET2`

## リッチメニュー

### リッチメニュー1

- サイズ: 1200×810 ピクセル
- 全体が1つのクリックエリア
- デフォルトで友だち追加時に設定

### リッチメニュー2

- 2分割レイアウト（600×810 が2つ）

### リッチメニュー3

- 3分割レイアウト（400×810 が3つ）

### リッチメニューA/B

- エイリアスを使った切り替え可能なメニュー

## データベース操作

### users テーブル（アカウント1）

```typescript
import {
  getUserByLineUserId,
  createUser,
  updateUserByLineUserId,
  upsertUser,
  deleteUserByLineUserId,
  updateLastAccessed,
} from '@/lib/db/users';

// ユーザー取得
const { data, error } = await getUserByLineUserId('U1234567890abcdef');

// ユーザー作成
await createUser({
  line_user_id: 'U1234567890abcdef',
  name: 'テストユーザー',
  profile_image_url: 'https://example.com/image.jpg',
});

// ユーザー更新
await updateUserByLineUserId('U1234567890abcdef', {
  name: '新しい名前',
});
```

### customers テーブル（アカウント2）

```typescript
import {
  getCustomerByLineUserId,
  createCustomer,
  updateCustomerByLineUserId,
  upsertCustomer,
  deleteCustomerByLineUserId,
  updateLastAccessedCustomer,
} from '@/lib/db/customers';

// カスタマー取得
const { data, error } = await getCustomerByLineUserId('U1234567890abcdef');

// カスタマー作成
await createCustomer({
  line_user_id: 'U1234567890abcdef',
  name: 'テストカスタマー',
  profile_image_url: 'https://example.com/image.jpg',
});

// カスタマー更新
await updateCustomerByLineUserId('U1234567890abcdef', {
  name: '新しい名前',
});
```

## ライセンス

MIT
