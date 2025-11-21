/**
 * クイズの問題定義
 * 各問題の正解を定義
 */

import type { Question } from "../../types/quiz";

/**
 * 全問題の定義
 * correctAnswerは0-3のインデックス（A=0, B=1, C=2, D=3）
 */
export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    imageUrl: "/images/slides/question1.jpg",
    correctAnswer: 0, // TODO: 実際の正解を設定
    timeLimit: 30,
  },
  {
    id: 2,
    imageUrl: "/images/slides/question2.jpg",
    correctAnswer: 1, // TODO: 実際の正解を設定
    timeLimit: 30,
  },
  {
    id: 3,
    imageUrl: "/images/slides/question3.jpg",
    correctAnswer: 2, // TODO: 実際の正解を設定
    timeLimit: 30,
  },
  {
    id: 4,
    imageUrl: "/images/slides/question4.jpg",
    correctAnswer: 0, // TODO: 実際の正解を設定
    timeLimit: 30,
  },
  {
    id: 5,
    imageUrl: "/images/slides/question5.jpg",
    correctAnswer: 3, // TODO: 実際の正解を設定
    timeLimit: 30,
  },
];

/**
 * 問題の正解を取得
 */
export function getCorrectAnswer(questionNumber: number): number {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionNumber);
  return question?.correctAnswer ?? 0;
}
