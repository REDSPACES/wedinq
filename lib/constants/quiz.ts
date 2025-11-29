/**
 * クイズの定数定義
 */

/** 問題の総数 */
export const TOTAL_QUESTIONS = 5;

/** 各問題の制限時間（秒） */
export const TIME_LIMIT_SECONDS = 30;

/** ランキング表示数 */
export const RANKING_DISPLAY_COUNT = 3;

/** 選択肢の数 */
export const CHOICE_COUNT = 4;

/** 選択肢のラベル */
export const CHOICE_LABELS = ["A", "B", "C", "D"] as const;

/** タイマーの更新間隔（ミリ秒） */
export const TIMER_INTERVAL_MS = 1000;

/** スクリーンスライドの並び（ファイル名） */
export const SLIDE_FILENAMES = [
  "1-TOP.jpg",
  "2-qr.jpg",
  "3-rule.jpg",
  "4-question-1.jpg",
  "5-answer-1.jpg",
  "6-question-2.jpg",
  "7-answer-2.jpg",
  "8-question-3.jpg",
  "9-answer-3.jpg",
  "10-question-4.jpg",
  "11-answer-4.jpg",
  "12-question-5.jpg",
  "13-answer-5.jpg",
  "14-result.jpg",
  "15-resultname.jpg",
  "16-end.jpg",
];

/** 問題スライドのインデックス（0始まり） */
export const QUESTION_SLIDE_INDICES = [3, 5, 7, 9, 11];

/** 回答/解説スライドのインデックス（0始まり） */
export const ANSWER_SLIDE_INDICES = [4, 6, 8, 10, 12];
