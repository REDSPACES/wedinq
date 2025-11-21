/**
 * ゲスト数監視フック
 */

"use client";

import { useEffect, useState } from "react";
import { subscribeToGuestCount } from "../firebase/quiz-service";

/**
 * ゲスト数をリアルタイムで監視するフック
 */
export function useGuestCount(sessionId: string | null) {
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToGuestCount(sessionId, (count) => {
        setGuestCount(count);
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

  return { guestCount, loading, error };
}
