/**
 * クイズセッション管理フック
 */

"use client";

import { useEffect, useState } from "react";
import type { QuizSession } from "../../types/quiz";
import { subscribeToSession } from "../firebase/quiz-service";

/**
 * セッション状態をリアルタイムで監視するフック
 */
export function useQuizSession(sessionId: string | null) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToSession(sessionId, (sessionData) => {
        setSession(sessionData);
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

  return { session, loading, error };
}
