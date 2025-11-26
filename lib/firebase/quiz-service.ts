/**
 * クイズシステムのFirestore操作サービス
 */

import {
	type DocumentData,
	type DocumentReference,
	type QuerySnapshot,
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import type { GuestAnswer, QuizSession, SessionStatus } from "../../types/quiz";
import { getFirestoreDb } from "./client";

const SESSIONS_COLLECTION = "quiz_sessions";
const GUESTS_COLLECTION = "quiz_guests";
const ANSWERS_COLLECTION = "quiz_answers";

/**
 * 新しいクイズセッションを作成
 */
export async function createQuizSession(
	totalQuestions = 5,
): Promise<string> {
	const db = getFirestoreDb();
	const sessionsRef = collection(db, SESSIONS_COLLECTION);

	const sessionData: Omit<QuizSession, "sessionId"> = {
		status: "waiting",
		currentQuestion: 1,
		totalQuestions,
		startedAt: Date.now(),
	};

	const docRef = await addDoc(sessionsRef, sessionData);
	return docRef.id;
}

/**
 * セッションのステータスを更新
 */
export async function updateSessionStatus(
	sessionId: string,
	status: SessionStatus,
	currentQuestion?: number,
): Promise<void> {
	const db = getFirestoreDb();
	const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);

	const updateData: Partial<QuizSession> = {
		status,
		...(currentQuestion !== undefined && { currentQuestion }),
		...(status === "finished" && { finishedAt: Date.now() }),
	};

	await updateDoc(sessionRef, updateData);
}

/**
 * セッション情報を取得
 */
export async function getQuizSession(
	sessionId: string,
): Promise<QuizSession | null> {
	const db = getFirestoreDb();
	const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
	const sessionSnap = await getDoc(sessionRef);

	if (!sessionSnap.exists()) {
		return null;
	}

	return {
		sessionId: sessionSnap.id,
		...sessionSnap.data(),
	} as QuizSession;
}

/**
 * セッション状態をリアルタイムで監視
 */
export function subscribeToSession(
	sessionId: string,
	callback: (session: QuizSession | null) => void,
): () => void {
	const db = getFirestoreDb();
	const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);

	return onSnapshot(sessionRef, (snapshot) => {
		if (!snapshot.exists()) {
			callback(null);
			return;
		}

		callback({
			sessionId: snapshot.id,
			...snapshot.data(),
		} as QuizSession);
	});
}

/**
 * ゲストを登録
 */
export async function registerGuest(
	sessionId: string,
	nickname: string,
): Promise<string> {
	const db = getFirestoreDb();
	const guestsRef = collection(db, GUESTS_COLLECTION);

	const guestData = {
		sessionId,
		nickname,
		joinedAt: serverTimestamp(),
	};

	const docRef = await addDoc(guestsRef, guestData);
	return docRef.id;
}

/**
 * セッションの参加者数を取得
 */
export async function getGuestCount(sessionId: string): Promise<number> {
	const db = getFirestoreDb();
	const guestsRef = collection(db, GUESTS_COLLECTION);
	const q = query(guestsRef, where("sessionId", "==", sessionId));
	const snapshot = await getDocs(q);
	return snapshot.size;
}

/**
 * 参加者数をリアルタイムで監視
 */
export function subscribeToGuestCount(
	sessionId: string,
	callback: (count: number) => void,
): () => void {
	const db = getFirestoreDb();
	const guestsRef = collection(db, GUESTS_COLLECTION);
	const q = query(guestsRef, where("sessionId", "==", sessionId));

	return onSnapshot(q, (snapshot) => {
		callback(snapshot.size);
	});
}

/**
 * 回答を送信
 */
export async function submitAnswer(
	sessionId: string,
	guestId: string,
	nickname: string,
	questionNumber: number,
	choice: number,
	isCorrect: boolean,
): Promise<void> {
	const db = getFirestoreDb();
	const answersRef = collection(db, ANSWERS_COLLECTION);

	const answerData: Omit<GuestAnswer, "answeredAt"> & { answeredAt: ReturnType<typeof serverTimestamp> } = {
		guestId,
		nickname,
		questionNumber,
		choice,
		isCorrect,
		answeredAt: serverTimestamp(),
	};

	await addDoc(answersRef, {
		...answerData,
		sessionId,
	});
}

/**
 * 特定の問題の回答をリアルタイムで監視
 */
export function subscribeToAnswers(
	sessionId: string,
	questionNumber: number,
	callback: (answers: GuestAnswer[]) => void,
): () => void {
	const db = getFirestoreDb();
	const answersRef = collection(db, ANSWERS_COLLECTION);
	const q = query(
		answersRef,
		where("sessionId", "==", sessionId),
		where("questionNumber", "==", questionNumber),
	);

	return onSnapshot(q, (snapshot) => {
		const answers: GuestAnswer[] = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				guestId: data.guestId,
				nickname: data.nickname,
				questionNumber: data.questionNumber,
				choice: data.choice,
				isCorrect: data.isCorrect,
				answeredAt: data.answeredAt?.toMillis?.() || Date.now(),
			};
		});
		callback(answers);
	});
}

/**
 * セッションの全回答を取得
 */
export async function getAllAnswers(
	sessionId: string,
): Promise<GuestAnswer[]> {
	const db = getFirestoreDb();
	const answersRef = collection(db, ANSWERS_COLLECTION);
	const q = query(answersRef, where("sessionId", "==", sessionId));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			guestId: data.guestId,
			nickname: data.nickname,
			questionNumber: data.questionNumber,
			choice: data.choice,
			isCorrect: data.isCorrect,
			answeredAt: data.answeredAt?.toMillis?.() || Date.now(),
		};
	});
}

/**
 * 特定の問題の回答数を取得
 */
export async function getAnswerCount(
	sessionId: string,
	questionNumber: number,
): Promise<number> {
	const db = getFirestoreDb();
	const answersRef = collection(db, ANSWERS_COLLECTION);
	const q = query(
		answersRef,
		where("sessionId", "==", sessionId),
		where("questionNumber", "==", questionNumber),
	);
	const snapshot = await getDocs(q);
	return snapshot.size;
}
