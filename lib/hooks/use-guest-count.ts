/**
 * 参加者数をリアルタイムで監視するカスタムフック
 */

"use client";

import { useEffect, useState } from "react";
import { subscribeToGuestCount } from "../firebase/quiz-service";

/**
 * セッションの参加者数をリアルタイムで監視
 */
export function useGuestCount(sessionId: string | null) {
	const [count, setCount] = useState(0);
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
			const unsubscribe = subscribeToGuestCount(sessionId, (guestCount) => {
				setCount(guestCount);
				setLoading(false);
			});

			return () => {
				unsubscribe();
			};
		} catch (err) {
			setError(err as Error);
			setLoading(false);
		}
	}, [sessionId]);

	return { count, loading, error };
}
