# wedinq

Next.js 16 (App Router) + React 19 + TypeScript 5 をベースに、Firebase Emulator Suite と整合したフロントエンド/フルスタック構成を素早く組み立てるためのリポジトリです。

## セットアップ
1. Node.js 20 以上と pnpm 8+ を用意する。
2. 依存関係を取得: `pnpm install`
3. Firebase CLI にログイン: `pnpm dlx firebase-tools login`（初回のみ）
4. Server Components で利用する環境変数は `.env.local` に定義する。

## 主なスクリプト
- `pnpm dev`: Next.js 開発サーバー
- `pnpm dev:emulator`: Next.js + Firebase Emulator Suite を並列起動（`concurrently` 使用）
- `pnpm firebase:emulator`: Firestore/Auth/Storage の Emulator Suite 単体起動
- `pnpm lint` / `pnpm biome:ci`: Biome による静的解析
- `pnpm format` / `pnpm format:check`: Biome フォーマッタ
- `pnpm typecheck`: `tsc --noEmit`
- `pnpm test`: 現時点ではプレースホルダー（将来的に Vitest 等を想定）
- `pnpm test:emulator`: Firebase Emulator を起動した状態で `pnpm test` をラップ

## ディレクトリ構成
```
src/
├ app/                # App Router (Server/Client Components)
├ components/
│   ├ UI/
│   ├ Models/
│   ├ Pages/
│   ├ Layouts/
│   └ Functional/
├ features/           # ドメインごとの application/domain/infrastructure 層を配置
├ server/
│   ├ actions/
│   ├ repositories/
│   └ adapters/
├ lib/
│   ├ firebase/       # client.ts / admin.ts で SDK 初期化予定
│   └ validators/
└ utils/

firebase/
├ indexes/
│   └ firestore.indexes.json
└ rules/
    ├ firestore.rules
    └ storage.rules

tests/
├ integration/
└ unit/
```

## Firebase 運用メモ
- `.firebaserc` の `wedinq-local` をローカル専用プロジェクト ID として扱い、ステージング/本番は別IDを設定する。
- `firebase.json` に Firestore/Auth/Storage のルールとエミュレータポートを定義済み。Functions や Hosting を追加する際はここに追記する。
- ルール/インデックス変更は `firebase/rules` と `firebase/indexes` 配下で Git 管理し、PR レビューできるようにする。
- `pnpm firebase:emulator` は `firebase-tools` がインストール済みであることが前提（`pnpm dlx firebase-tools login` を忘れずに）。

## 次のステップ
1. `src/lib/firebase/{client,admin}.ts` を実装し、環境変数と Emulator 切り替えを一元化する。
2. `features/<domain>` 配下に application/domain/infrastructure 層を追加し、Server Actions と Repository を結線する。
3. `dependency-cruiser` と `eslint-plugin-strict-dependencies` を導入して層違反を検知する。
4. Vitest などでユニット/統合テストを整備し、`pnpm test` の実体を追加する。
