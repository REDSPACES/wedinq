# Firebase セットアップガイド

このドキュメントは、wedinq クイズアプリケーションで Firebase を設定する方法を説明します。

## 前提条件

- Google アカウント
- Node.js と pnpm がインストールされていること

## 手順

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `wedinq-quiz`）
4. Google Analytics は任意で設定
5. プロジェクトを作成

### 2. Firestore Database の有効化

1. Firebase Console の左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. セキュリティルールは「本番環境モード」を選択
4. ロケーションを選択（推奨: `asia-northeast1` - 東京）
5. 「有効にする」をクリック

### 3. Firebase 設定情報の取得

1. Firebase Console の左メニューから「プロジェクトの設定」（歯車アイコン）を選択
2. 「全般」タブで下にスクロール
3. 「マイアプリ」セクションで Web アイコン（`</>`）をクリック
4. アプリのニックネームを入力（例: `wedinq-web`）
5. Firebase Hosting の設定はスキップ
6. 表示される設定情報（`firebaseConfig`）をコピー

### 4. 環境変数の設定

1. プロジェクトルートで `.env.local.example` をコピー:
   ```bash
   cp .env.local.example .env.local
   ```

2. `.env.local` ファイルを編集し、Firebase の設定情報を入力:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

### 5. Firestore セキュリティルールの設定

Firebase Console で「Firestore Database」→「ルール」タブを開き、以下のルールを設定:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // クイズセッション - 読み取りは誰でも、書き込みは誰でも（制御画面から）
    match /quiz_sessions/{sessionId} {
      allow read: if true;
      allow write: if true;
    }

    // ゲスト登録 - 読み取りは誰でも、書き込みは誰でも
    match /quiz_guests/{guestId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }

    // 回答データ - 読み取りは誰でも、作成は誰でも
    match /quiz_answers/{answerId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

**注意**: このルールは開発・テスト用です。本番環境では適切な認証とアクセス制御を実装してください。

### 6. Firestore インデックスの作成（オプション）

Firebase Console で「Firestore Database」→「インデックス」タブを開き、必要に応じて以下のインデックスを作成:

- コレクション: `quiz_answers`
  - フィールド: `sessionId` (昇順), `questionNumber` (昇順)
  - クエリスコープ: コレクション

- コレクション: `quiz_guests`
  - フィールド: `sessionId` (昇順), `joinedAt` (昇順)
  - クエリスコープ: コレクション

### 7. 依存関係のインストール

```bash
pnpm install
```

### 8. 問題の正解を設定

`lib/constants/quiz-questions.ts` ファイルを開き、各問題の `correctAnswer` を実際の問題に合わせて設定してください:

```typescript
export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    imageUrl: "/quiz-slides/4-question-1.jpg",
    correctAnswer: 2, // 0=A, 1=B, 2=C, 3=D
    timeLimit: 30,
  },
  // ...
];
```

### 9. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで以下の URL にアクセス:
- 司会者用画面: http://localhost:3000/control
- 観覧用画面: http://localhost:3000/screen
- 回答用画面: http://localhost:3000/quiz

## 使用方法

### クイズの実施手順

1. **準備**
   - 司会者用画面（`/control`）を開く
   - 観覧用画面（`/screen`）をプロジェクターに表示
   - 参加者に回答用画面（`/quiz`）の QR コードまたは URL を共有

2. **参加者の登録**
   - 参加者が `/quiz` にアクセスし、ニックネームを入力
   - 司会者画面で参加者数を確認

3. **クイズ開始**
   - 司会者が「クイズを開始」ボタンをクリック
   - 観覧画面が自動的に問題スライドに切り替わる
   - 参加者画面も自動的に問題画面に切り替わる

4. **回答収集**
   - 参加者が選択肢を選んで回答を送信
   - 司会者画面でリアルタイムに回答を確認

5. **次の問題へ**
   - 司会者が「次の問題へ」ボタンをクリック
   - 全画面が自動的に次の問題へ遷移
   - 問題 5 まで繰り返し

6. **結果発表**
   - 最終問題の後、司会者が「最終結果」ボタンをクリック
   - ランキングが表示される
   - 観覧画面を結果スライドに手動で切り替え

## データフロー

```
司会者が「クイズ開始」
  ↓
Firestore に status=playing, currentQuestion=1 を書き込み
  ↓
観覧画面・参加者画面がリアルタイムで受信
  ↓
全画面が自動的に問題 1 へ遷移
  ↓
参加者が回答送信 → Firestore に回答データ保存
  ↓
司会者画面がリアルタイムで受信・集計
  ↓
司会者が「次の問題へ」→ Firestore の currentQuestion を更新
  ↓
全画面が自動的に次の問題へ遷移
```

## トラブルシューティング

### Firebase 接続エラー

**エラー**: `Firebase configuration is missing`

**解決策**:
- `.env.local` ファイルが正しく作成されているか確認
- 環境変数の名前が `NEXT_PUBLIC_` で始まっているか確認
- 開発サーバーを再起動（環境変数の変更後は必須）

### データが同期されない

**確認ポイント**:
1. Firestore Database が有効化されているか
2. セキュリティルールが正しく設定されているか
3. ブラウザの開発者コンソールでエラーが出ていないか
4. セッション ID が正しく保存されているか（localStorage を確認）

### 参加者が「セッションが開始されていません」と表示される

**原因**: 司会者がクイズを開始する前に参加者がアクセスした

**解決策**:
1. 司会者画面で「クイズを開始」ボタンをクリック
2. 参加者画面を再読み込み

## セキュリティに関する注意

現在のセキュリティルールは開発・テスト用です。本番環境では以下を検討してください:

- Firebase Authentication の導入
- セッション ID による適切なアクセス制御
- 回答の改ざん防止
- レート制限の実装

## 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
