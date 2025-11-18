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
