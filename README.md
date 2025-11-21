# WedInQ - Wedding Quiz System

リアルタイム連動型クイズシステム

## 概要

結婚式などのイベントで使用できる、司会者・観覧画面・参加者スマホの3画面を連動させたクイズシステムです。Firebase Firestoreを使用してリアルタイムに状態を同期します。

## 技術スタック

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Firebase 11** (Firestore)
- **Biome** (linter/formatter)

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestoreを有効化
3. Web アプリを追加し、設定情報を取得

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成:

```bash
cp .env.local.example .env.local
```

`.env.local` に Firebase の設定情報を記入:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# クイズセッションID（任意）
NEXT_PUBLIC_QUIZ_SESSION_ID=wedding-quiz-2025
```

### 4. Firestore セキュリティルール

Firebase Console で以下のセキュリティルールを設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // クイズセッション
    match /quizSessions/{sessionId} {
      allow read: if true;
      allow write: if true; // 本番環境では適切な認証を設定

      // ゲスト
      match /guests/{guestId} {
        allow read: if true;
        allow write: if true;
      }

      // 回答
      match /answers/{answerId} {
        allow read: if true;
        allow write: if true;
      }
    }
  }
}
```

### 5. Firestore インデックス

以下のインデックスを作成（Firebase Console で自動的に提案されます）:

- Collection: `quizSessions/{sessionId}/answers`
  - Fields: `questionNumber` (Ascending), `answeredAt` (Ascending)

## 開発

```bash
# 開発サーバー起動
pnpm dev

# コードフォーマット
pnpm format

# Lintチェック
pnpm lint

# 型チェック
pnpm typecheck

# ビルド
pnpm build
```

## 使用方法

### 1. 司会者用画面 (`/control`)

クイズの進行を管理するコントロールパネル

- **クイズを開始**: セッションを開始し、第1問を表示
- **結果を表示**: 現在の問題のランキングを表示
- **次の問題へ**: 次の問題に進む
- **セッションをリセット**: セッションを初期状態に戻す

### 2. 観覧用画面 (`/screen`)

16:9の大画面用スライド表示

- 待機画面（QRコード表示）
- 問題表示（カウントダウンタイマー付き）
- 結果表示（ランキング）
- 終了画面

### 3. 参加者用画面 (`/quiz`)

スマートフォン用の回答画面

1. イントロ画面で「はじめる」をタップ
2. ニックネームを入力
3. クイズ開始を待機
4. 問題が表示されたら選択肢を選んで回答
5. 全問題終了後、スクリーンで結果を確認

## データフロー

```
[司会者画面] ---> [Firestore] ---> [観覧画面]
                      |
                      v
                 [参加者画面]
```

### シーケンス

1. 司会者が「クイズを開始」→ Firestore に `status=playing` を書き込み
2. 観覧画面・参加者画面が Firestore の変更をリアルタイムで受信
3. 参加者が回答送信 → Firestore に回答データを書き込み
4. 司会者画面が回答をリアルタイムで受信・集計
5. 司会者が「次の問題へ」→ Firestore に `currentQuestion++` を書き込み
6. 全画面が自動的に次の問題へ遷移

## ディレクトリ構造

```
wedinq/
├── app/                          # App Router
│   ├── control/page.tsx         # 司会者用画面
│   ├── screen/page.tsx          # 観覧用画面
│   └── quiz/page.tsx            # 参加者用画面
├── components/
│   └── Pages/                   # ページコンポーネント
│       ├── ControlPanel/
│       ├── ScreenDisplay/
│       └── GuestQuiz/
├── lib/
│   ├── firebase/                # Firebase関連
│   │   ├── config.ts
│   │   ├── client.ts
│   │   └── quiz-service.ts
│   ├── hooks/                   # カスタムフック
│   │   ├── use-quiz-session.ts
│   │   ├── use-quiz-answers.ts
│   │   └── use-guest-count.ts
│   ├── constants/               # 定数定義
│   │   ├── quiz.ts
│   │   └── quiz-questions.ts
│   └── utils/                   # ユーティリティ
│       └── session-manager.ts
└── types/
    └── quiz.ts                  # 型定義
```

## トラブルシューティング

### Firebase接続エラー

- `.env.local` に正しい設定が記載されているか確認
- Firebase Console でプロジェクトが有効化されているか確認

### リアルタイム更新が動作しない

- Firestore セキュリティルールが正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

### 正解判定が正しくない

- `lib/constants/quiz-questions.ts` の `correctAnswer` が正しく設定されているか確認

## TODO

- [ ] Firebase Emulator Suiteの統合
- [ ] 認証機能の追加
- [ ] 問題画像のアップロード機能
- [ ] スコアボードの保存機能
- [ ] CI/CDの設定

## ライセンス

MIT
