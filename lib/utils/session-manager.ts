/**
 * セッションID・ゲストID管理ユーティリティ
 */

const SESSION_ID_KEY = "wedinq_session_id";
const GUEST_ID_KEY = "wedinq_guest_id";
const GUEST_NICKNAME_KEY = "wedinq_guest_nickname";

/**
 * セッションIDをローカルストレージに保存
 */
export function saveSessionId(sessionId: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(SESSION_ID_KEY, sessionId);
}

/**
 * セッションIDをローカルストレージから取得
 */
export function getSessionId(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(SESSION_ID_KEY);
}

/**
 * セッションIDをクリア
 */
export function clearSessionId(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * ゲストIDをローカルストレージに保存
 */
export function saveGuestId(guestId: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(GUEST_ID_KEY, guestId);
}

/**
 * ゲストIDをローカルストレージから取得
 */
export function getGuestId(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(GUEST_ID_KEY);
}

/**
 * ゲストIDをクリア
 */
export function clearGuestId(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(GUEST_ID_KEY);
}

/**
 * ニックネームをローカルストレージに保存
 */
export function saveNickname(nickname: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(GUEST_NICKNAME_KEY, nickname);
}

/**
 * ニックネームをローカルストレージから取得
 */
export function getNickname(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(GUEST_NICKNAME_KEY);
}

/**
 * ニックネームをクリア
 */
export function clearNickname(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(GUEST_NICKNAME_KEY);
}

/**
 * 全てのデータをクリア
 */
export function clearAllData(): void {
	clearSessionId();
	clearGuestId();
	clearNickname();
}
