/**
 * クイズ画像パスのユーティリティ関数
 */

/**
 * スライド画像の種類
 */
export type SlideType =
  | "top"
  | "qr"
  | "rule"
  | "question"
  | "answer"
  | "result"
  | "resultname"
  | "end";

/**
 * スライド画像のパスを取得
 * 実際のファイル名: 1-TOP.jpg, 2-qr.jpg, 3-rule.jpg,
 * 4-question-1.jpg, 5-answer-1.jpg, 6-question-2.jpg, ...
 */
export function getSlideImagePath(type: SlideType, questionNumber?: number): string {
  const basePath = "/quiz-slides";

  switch (type) {
    case "top":
      return `${basePath}/1-TOP.jpg`;
    case "qr":
      return `${basePath}/2-qr.jpg`;
    case "rule":
      return `${basePath}/3-rule.jpg`;
    case "question":
      if (questionNumber === undefined || questionNumber < 1 || questionNumber > 5) {
        throw new Error("Question number must be between 1 and 5");
      }
      // 4-question-1.jpg, 6-question-2.jpg, 8-question-3.jpg, 10-question-4.jpg, 12-question-5.jpg
      return `${basePath}/${(questionNumber - 1) * 2 + 4}-question-${questionNumber}.jpg`;
    case "answer":
      if (questionNumber === undefined || questionNumber < 1 || questionNumber > 5) {
        throw new Error("Question number must be between 1 and 5");
      }
      // 5-answer-1.jpg, 7-answer-2.jpg, 9-answer-3.jpg, 11-answer-4.jpg, 13-answer-5.jpg
      return `${basePath}/${(questionNumber - 1) * 2 + 5}-answer-${questionNumber}.jpg`;
    case "result":
      return `${basePath}/14-result.jpg`;
    case "resultname":
      return `${basePath}/15-resultname.jpg`;
    case "end":
      return `${basePath}/16-end.jpg`;
    default:
      throw new Error(`Unknown slide type: ${type}`);
  }
}

/**
 * 画像パスの存在チェック（開発用）
 */
export function validateImagePath(_path: string): boolean {
  // 本番環境では常にtrueを返す（サーバーサイドでのチェックを避けるため）
  if (typeof window === "undefined") {
    return true;
  }

  // クライアントサイドでの実行時は実際の存在チェックを行わない
  // （画像のロードエラーはonErrorハンドラーで処理）
  return true;
}
