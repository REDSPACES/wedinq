/**
 * クイズ回答をリアルタイムで監視するカスタムフック
 */

"use client";

import { useEffect, useState } from "react";
import type { GuestAnswer } from "../../types/quiz";
import { subscribeToAnswers } from "../firebase/quiz-service";

/**
 * 特定の問題の回答をリアルタイムで監視
 */
export function useQuizAnswers(
	sessionId: string | null,
	questionNumber: number,
) {
	const [answers, setAnswers] = useState<GuestAnswer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!sessionId) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const unsubscribe = subscribeToAnswers(
				sessionId,
				questionNumber,
				(answersData) => {
					setAnswers(answersData);
					setLoading(false);
				},
			);

			return () => {
				unsubscribe();
			};
		} catch (err) {
			setError(err as Error);
			setLoading(false);
		}
	}, [sessionId, questionNumber]);

	return { answers, loading, error };
}
