/**
 * セッションID管理ユーティリティ
 * 本番環境では固定のセッションIDを使用
 */

/**
 * 現在のクイズセッションID
 * 本番環境では環境変数から取得、開発環境ではデフォルト値を使用
 */
export const CURRENT_SESSION_ID =
  process.env.NEXT_PUBLIC_QUIZ_SESSION_ID || "default-session";

/**
 * ゲストIDを生成（ローカルストレージに保存）
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const storageKey = "wedinq_guest_id";
  let guestId = localStorage.getItem(storageKey);

  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, guestId);
  }

  return guestId;
}

/**
 * ゲストニックネームを保存
 */
export function saveGuestNickname(nickname: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("wedinq_guest_nickname", nickname);
}

/**
 * ゲストニックネームを取得
 */
export function getGuestNickname(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("wedinq_guest_nickname");
}
