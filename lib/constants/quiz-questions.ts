/**
 * クイズ問題データと正解定義
 */

import type { Question } from "../../types/quiz";

/**
 * クイズ問題データ（正解を含む）
 *
 * 注意: correctAnswerは実際の問題内容に合わせて設定してください
 */
export const QUIZ_QUESTIONS: Question[] = [
	{
		id: 1,
		imageUrl: "/quiz-slides/4-question-1.jpg",
		correctAnswer: 0, // TODO: 実際の正解に変更してください (0=A, 1=B, 2=C, 3=D)
		timeLimit: 30,
	},
	{
		id: 2,
		imageUrl: "/quiz-slides/6-question-2.jpg",
		correctAnswer: 0, // TODO: 実際の正解に変更してください
		timeLimit: 30,
	},
	{
		id: 3,
		imageUrl: "/quiz-slides/8-question-3.jpg",
		correctAnswer: 0, // TODO: 実際の正解に変更してください
		timeLimit: 30,
	},
	{
		id: 4,
		imageUrl: "/quiz-slides/10-question-4.jpg",
		correctAnswer: 0, // TODO: 実際の正解に変更してください
		timeLimit: 30,
	},
	{
		id: 5,
		imageUrl: "/quiz-slides/12-question-5.jpg",
		correctAnswer: 0, // TODO: 実際の正解に変更してください
		timeLimit: 30,
	},
];

/**
 * 指定された問題番号の正解を取得
 */
export function getCorrectAnswer(questionNumber: number): number | null {
	const question = QUIZ_QUESTIONS.find((q) => q.id === questionNumber);
	return question ? question.correctAnswer : null;
}

/**
 * 回答が正解かどうかを判定
 */
export function isCorrectAnswer(
	questionNumber: number,
	choice: number,
): boolean {
	const correctAnswer = getCorrectAnswer(questionNumber);
	return correctAnswer !== null && correctAnswer === choice;
}
