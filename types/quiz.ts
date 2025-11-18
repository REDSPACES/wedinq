/**
 * クイズセッションの状態
 */
export type SessionStatus = "waiting" | "playing" | "finished";

/**
 * ゲストの回答状態
 */
export interface GuestAnswer {
  guestId: string;
  nickname: string;
  questionNumber: number;
  choice: number; // 0-3: A-D の選択肢
  answeredAt: number; // タイムスタンプ(ms)
  isCorrect: boolean;
}

/**
 * クイズセッション全体の状態
 */
export interface QuizSession {
  sessionId: string;
  status: SessionStatus;
  currentQuestion: number; // 1-5
  totalQuestions: number; // 常に5
  startedAt?: number;
  finishedAt?: number;
}

/**
 * 問題データ
 */
export interface Question {
  id: number;
  imageUrl: string; // JPGスライド画像のURL
  correctAnswer: number; // 0-3: 正解の選択肢インデックス
  timeLimit: number; // 秒数（通常30秒）
}

/**
 * ランキングエントリ
 */
export interface RankingEntry {
  rank: number;
  nickname: string;
  correctCount: number;
  averageResponseTime: number; // ms
}

/**
 * ゲスト画面の状態
 */
export type GuestScreenState =
  | "intro"
  | "nickname_input"
  | "waiting_for_question"
  | "question_display"
  | "waiting_next"
  | "finished"
  | "end";

/**
 * スクリーン(スライド)画面の状態
 */
export type ScreenDisplayState = "standby" | "question_display" | "result_display" | "finished";
