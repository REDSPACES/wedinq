# アーキテクチャ指針

## アプリ全体アーキテクチャ（Next.js + Firebase）

### 目的
- バックエンドを薄く保ちつつ、Next.jsフルスタックとFirebaseを直結させて最短経路でデータを届ける。
- サーバーサイドの責務（ドメインサービス・データアクセス）をServer Components/ActionsとRepository層に集約し、クライアントはUIに専念する。
- Firebase Emulatorや依存Lintを土台に、規模拡大後も安全に変更できる体制を確立する。

### レイヤ構成
- **UI/ルート層**: `src/app`（推奨）または`src/pages`がHTTPルートを担い、Server/Client Componentを組み合わせる。
- **アプリケーション層**: `features/<domain>/application`や`server/actions`内のServer Actionがユースケースを実装し、Repositoryを通じてFirebaseへアクセス。
- **ドメイン層**: `features/<domain>/domain`でエンティティ/バリュー/サービスを型安全に定義。
- **インフラ層**: `features/<domain>/infrastructure`や`server/repositories`でFirestore/Storage/Auth/外部APIをラップ。Firebase Admin SDKを利用し、クライアントSDKはAuthやリアルタイム購読などUI必要箇所に限定。
- **API/Middleware**: `/api/*`は外部Webhookや長時間処理専用。`middleware.ts`でFirebaseトークン検証やA/B判定を行い、Server Componentsへユーザー情報を渡す。
- **バックグラウンド**: 非同期バッチはFirebase Functionsへ寄せ、Firestore変更時は`/api/revalidate`や`revalidateTag`を叩いてNext.jsキャッシュと同期。

### ディレクトリ骨格
```
repo/
├ firebase/
│   ├ indexes/
│   └ rules/
├ src/
│   ├ app/ or pages/      # ルーティング・Server/Client Component
│   ├ components/
│   ├ features/
│   │   └ <domain>/
│   │       ├ application/    # Server Action・ユースケース
│   │       ├ domain/         # 型・エンティティ
│   │       └ infrastructure/ # Repository実装（Firestore/Storage）
│   ├ server/
│   │   ├ actions/
│   │   ├ repositories/
│   │   └ adapters/
│   ├ lib/
│   │   ├ firebase/
│   │   │   ├ admin.ts    # Admin SDK初期化
│   │   │   └ client.ts   # Client SDK初期化
│   │   ├ config.ts
│   │   └ validators/
│   ├ middleware.ts
│   └ utils/
└ tests/
    ├ integration/
    └ unit/
```

### 運用・テスト
- Firebase Emulator Suiteを`pnpm dev:emulator`でNext.jsと並列起動し、`lib/firebase/*`で本番/エミュレータを切り替える。
- CIでは `next lint` + `eslint-plugin-strict-dependencies` + `dependency-cruiser` で層違反を検出し、`pnpm test:emulator`でFirestore/Functions/Rulesを検証。
- Firestoreルールとインデックスは`firebase/`配下でバージョン管理し、デプロイ前に`npm run lint:rules`等で検証。

## フロントエンドのディレクトリ戦略

### ディレクトリ全体像
```
src/
├── pages/                # Next.jsのルーティング（例: /products, /brands）
│   ├── index.tsx
│   ├── products/
│   │   └── [id].tsx
│   └── brands/
│       └── [id].tsx
├── components/           # 下記5分類で責務を分離
│   ├── UI/
│   ├── Models/
│   ├── Pages/           # ルートごとの画面コンポーネント
│   ├── Layouts/
│   └── Functional/
└── assets/ (optional)    # 画像やフォントを置く場合のみ
```

### コンポーネント層: `src/components/`
- 5分類（UI / Models / Pages / Layouts / Functional）で責務を明示し、Next.jsルーティングの`src/pages`とは別に管理。
- 各分類の責務:
  - `UI`: ビジネスロジックを持たない純粋な表示要素。
  - `Models`: ドメインロジック+UI組み立て。複数ページで共有する業務固有処理を吸収。
  - `Pages`: 各ページ専用の実装。再利用を想定しない。
  - `Layouts`: アプリ共通の骨格やフレーム。
  - `Functional`: UIを持たないアプリ機能（Analytics等）。

### 配置判断フロー
1. ページ固有なら `Pages`。
2. アプリ骨格なら `Layouts`。
3. 複数ページで扱うドメインロジックなら `Models`。
4. 表示専用なら `UI`（ドメイン名でもOK、振る舞いが純粋ならここ）。
5. 非UI機能なら `Functional`。

### 依存ルール
- 横方向または下位層への一方向依存のみ許可する階層モデル。
  - Pages → Models/UI/Functional
  - Models・Layouts → UI/Functional
  - UI → Functional
- Pages間の相互参照は禁止（`allowSameModule: false`）でページの局所性を担保。
- `eslint-plugin-strict-dependencies` でルールをコード化し、`dependency-cruiser` で循環参照をPR時に検出。

### テストとドキュメント
- 実装/テストを同一ディレクトリに束ね、対象コンポーネントとの距離をゼロにする。
- ディレクトリ配下にREADMEを置き、責務や利用例を局所的に共有する運用を推奨。

### スタイル共有の扱い
- シンプルなテーマ切り替えを想定していないため、デザイントークンやEmotionのmixinは `components/UI/**` か `lib/style/**`（任意）に共存させ、余分な階層を増やさない。
- Stylelintや共通Mixinsが必要な場合も、関連コンポーネントの近くに配置し、フラットな構造を保つ。
