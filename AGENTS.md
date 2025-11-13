# アーキテクチャ指針

## 現在の構成

### 技術スタック
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Biome** (linter/formatter)

### 現在のディレクトリ構造
```
wedinq/
├ app/                    # App Routerのルーティング
│   ├ layout.tsx         # ルートレイアウト
│   ├ page.tsx           # トップページ
│   └ globals.css        # グローバルスタイル
├ public/                # 静的アセット
└ package.json
```

### 開発コマンド
- `pnpm dev`: 開発サーバー起動
- `pnpm build`: プロダクションビルド
- `pnpm lint`: Biomeによるコード検証
- `pnpm format`: Biomeによるコード整形
- `pnpm typecheck`: TypeScript型チェック

---

## 計画中の構成

### 目的
- バックエンドを薄く保ちつつ、Next.jsフルスタックとFirebaseを直結させて最短経路でデータを届ける。
- サーバーサイドの責務（ドメインサービス・データアクセス）をServer Components/ActionsとRepository層に集約し、クライアントはUIに専念する。
- Firebase Emulatorや依存Lintを土台に、規模拡大後も安全に変更できる体制を確立する。

### 計画中のレイヤ構成
- **UI/ルート層**: `src/app`（App Router）がHTTPルートを担い、Server/Client Componentを組み合わせる。
- **アプリケーション層**: `features/<domain>/application`や`server/actions`内のServer Actionがユースケースを実装し、Repositoryを通じてFirebaseへアクセス。
- **ドメイン層**: `features/<domain>/domain`でエンティティ/バリュー/サービスを型安全に定義。
- **インフラ層**: `features/<domain>/infrastructure`や`server/repositories`でFirestore/Storage/Auth/外部APIをラップ。Firebase Admin SDKを利用し、クライアントSDKはAuthやリアルタイム購読などUI必要箇所に限定。
- **API/Middleware**: `/api/*`は外部Webhookや長時間処理専用。`middleware.ts`でFirebaseトークン検証やA/B判定を行い、Server Componentsへユーザー情報を渡す。
- **バックグラウンド**: 非同期バッチはFirebase Functionsへ寄せ、Firestore変更時は`/api/revalidate`や`revalidateTag`を叩いてNext.jsキャッシュと同期。

### 計画中のディレクトリ骨格
```
repo/
├ firebase/                     # TODO: Firebase統合時に追加
│   ├ indexes/
│   └ rules/
├ src/                          # TODO: app/からsrc/app/へ移行
│   ├ app/                      # ルーティング・Server/Client Component
│   ├ components/               # 5分類（UI/Models/Pages/Layouts/Functional）
│   ├ features/
│   │   └ <domain>/
│   │       ├ application/      # Server Action・ユースケース
│   │       ├ domain/           # 型・エンティティ
│   │       └ infrastructure/   # Repository実装（Firestore/Storage）
│   ├ server/
│   │   ├ actions/
│   │   ├ repositories/
│   │   └ adapters/
│   ├ lib/
│   │   ├ firebase/             # TODO: Firebase統合時に追加
│   │   │   ├ admin.ts          # Admin SDK初期化
│   │   │   └ client.ts         # Client SDK初期化
│   │   ├ config.ts
│   │   └ validators/
│   ├ middleware.ts
│   └ utils/
└ tests/                        # TODO: テスト環境構築時に追加
    ├ integration/
    └ unit/
```

### 計画中の運用・テスト（Firebase統合後）
- Firebase Emulator Suiteを`pnpm dev:emulator`でNext.jsと並列起動し、`lib/firebase/*`で本番/エミュレータを切り替える。
- CIでは `pnpm biome:ci` + `eslint-plugin-strict-dependencies` + `dependency-cruiser` で層違反を検出し、`pnpm test:emulator`でFirestore/Functions/Rulesを検証。
- Firestoreルールとインデックスは`firebase/`配下でバージョン管理し、デプロイ前に検証。

## フロントエンドのディレクトリ戦略（計画）

### App Router使用時の考慮事項

#### Server/Client Components戦略
- **app/配下のpage.tsx/layout.tsx**: デフォルトはServer Component。データフェッチやビジネスロジックはここで処理。
- **UI層**: 原則Client Component（`'use client'`）。インタラクティブな要素を担当。
- **Models層**: サーバーサイド処理を含む場合はServer Component可。クライアント側で使う場合はClient Component。
- **Pages層**: ルートに応じてServer/Clientを使い分け。ページ固有のロジックを集約。
- **Layouts層**: 共通レイアウトは原則Server Component。インタラクティブな部分はClient Componentで分離。
- **Functional層**: Analytics等はClient Component。Server Actionsと組み合わせる場合も。

### 計画中のディレクトリ全体像
```
src/
├── app/                  # App Routerのルーティング（例: /products, /brands）
│   ├── layout.tsx       # ルートレイアウト (Server Component)
│   ├── page.tsx         # トップページ (Server Component)
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx
│   └── brands/
│       └── [id]/
│           └── page.tsx
├── components/           # 下記5分類で責務を分離
│   ├── UI/              # 純粋な表示要素（主にClient Component）
│   ├── Models/          # ドメインロジック+UI組み立て
│   ├── Pages/           # ルートごとの画面コンポーネント
│   ├── Layouts/         # アプリ共通の骨格
│   └── Functional/      # UIを持たないアプリ機能
└── public/              # 静的アセット
```

### コンポーネント層: `src/components/`
- 5分類（UI / Models / Pages / Layouts / Functional）で責務を明示し、App Routerの`src/app`とは別に管理。
- 各分類の責務:
  - `UI`: ビジネスロジックを持たない純粋な表示要素（Button、Input等）。
  - `Models`: ドメインロジック+UI組み立て。複数ページで共有する業務固有処理を吸収（ProductCard、UserProfile等）。
  - `Pages`: 各ページ専用の実装。再利用を想定しない（ProductDetailContent、BrandListContent等）。
  - `Layouts`: アプリ共通の骨格やフレーム（Header、Footer、Sidebar等）。
  - `Functional`: UIを持たないアプリ機能（Analytics、ErrorBoundary等）。

### 配置判断フロー
1. ページ固有なら `Pages`。
2. アプリ骨格なら `Layouts`。
3. 複数ページで扱うドメインロジックなら `Models`。
4. 表示専用なら `UI`（ドメイン名でもOK、振る舞いが純粋ならここ）。
5. 非UI機能なら `Functional`。

### 依存ルール（計画）
- 横方向または下位層への一方向依存のみ許可する階層モデル。
  - app/ → components/Pages/Models/UI/Functional
  - Pages → Models/UI/Functional
  - Models・Layouts → UI/Functional
  - UI → Functional
- Pages間の相互参照は禁止（`allowSameModule: false`）でページの局所性を担保。
- **TODO**: `eslint-plugin-strict-dependencies` でルールをコード化し、`dependency-cruiser` で循環参照をPR時に検出。

### テストとドキュメント（計画）
- 実装/テストを同一ディレクトリに束ね、対象コンポーネントとの距離をゼロにする。
- ディレクトリ配下にREADMEを置き、責務や利用例を局所的に共有する運用を推奨。

### スタイル共有の扱い
- 現在はTailwind CSS 4を使用。
- カスタムコンポーネントやデザイントークンが必要になった場合は `components/UI/**` か `lib/style/**`（任意）に配置。
- 余分な階層を増やさず、フラットな構造を保つ。

### 参考資料
- [フロントエンド ディレクトリ戦略(ZOZO事例)](https://techblog.zozo.com/entry/zozotown-frontend-directory-design)
