/**
 * クイズセッションの状態管理
 * localStorage + CustomEvent を使った簡易的なリアルタイム同期
 */

export interface QuizSessionState {
  currentSlideIndex: number;
  sessionStatus: "waiting" | "playing" | "finished";
  currentQuestion: number;
  lastUpdated: number;
}

const STORAGE_KEY = "quiz_session_state";
const EVENT_NAME = "quiz_state_change";

/**
 * クイズ状態を保存
 */
export function saveQuizState(state: Partial<QuizSessionState>): void {
  try {
    const currentState = getQuizState();
    const newState: QuizSessionState = {
      ...currentState,
      ...state,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    // カスタムイベントを発火して他のタブ/ウィンドウに通知
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: newState,
      }),
    );
  } catch (error) {
    console.error("Failed to save quiz state:", error);
  }
}

/**
 * クイズ状態を取得
 */
export function getQuizState(): QuizSessionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load quiz state:", error);
  }

  // デフォルト状態
  return {
    currentSlideIndex: 0,
    sessionStatus: "waiting",
    currentQuestion: 1,
    lastUpdated: Date.now(),
  };
}

/**
 * クイズ状態の変更を監視
 */
export function subscribeToQuizState(callback: (state: QuizSessionState) => void): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        callback(newState);
      } catch (error) {
        console.error("Failed to parse quiz state from storage event:", error);
      }
    }
  };

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<QuizSessionState>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  // storage イベント（別タブでの変更を検知）
  window.addEventListener("storage", handleStorageChange);

  // カスタムイベント（同一タブ内での変更を検知）
  window.addEventListener(EVENT_NAME, handleCustomEvent);

  // クリーンアップ関数
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
  };
}

/**
 * クイズ状態をリセット
 */
export function resetQuizState(): void {
  saveQuizState({
    currentSlideIndex: 0,
    sessionStatus: "waiting",
    currentQuestion: 1,
  });
}
