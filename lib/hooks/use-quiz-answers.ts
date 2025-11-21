/**
 * クイズ回答監視フック
 */

"use client";

import { useEffect, useState } from "react";
import type { GuestAnswer } from "../../types/quiz";
import { subscribeToAnswers } from "../firebase/quiz-service";

/**
 * 回答をリアルタイムで監視するフック
 */
export function useQuizAnswers(sessionId: string | null, currentQuestion?: number) {
  const [allAnswers, setAllAnswers] = useState<GuestAnswer[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<GuestAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToAnswers(sessionId, (answers) => {
        setAllAnswers(answers);

        // 現在の問題の回答のみフィルタリング
        if (currentQuestion !== undefined) {
          const filtered = answers.filter((a) => a.questionNumber === currentQuestion);
          setCurrentAnswers(filtered);
        } else {
          setCurrentAnswers(answers);
        }

        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [sessionId, currentQuestion]);

  return { allAnswers, currentAnswers, loading, error };
}
