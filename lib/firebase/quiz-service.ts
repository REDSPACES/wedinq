/**
 * クイズセッション管理サービス
 * Firestoreとのデータ同期を担当
 */

import {
  type DocumentData,
  type DocumentReference,
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { GuestAnswer, QuizSession, SessionStatus } from "../../types/quiz";
import { getFirebaseDb } from "./client";

/**
 * セッションIDを生成
 */
export function generateSessionId(): string {
  return `session_${Date.now()}`;
}

/**
 * クイズセッションを作成
 */
export async function createQuizSession(sessionId: string): Promise<void> {
  const db = getFirebaseDb();
  const sessionRef = doc(db, "quizSessions", sessionId);

  const session: QuizSession = {
    sessionId,
    status: "waiting",
    currentQuestion: 1,
    totalQuestions: 5,
    startedAt: Date.now(),
  };

  await setDoc(sessionRef, session);
}

/**
 * セッション状態を更新
 */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  currentQuestion?: number,
): Promise<void> {
  const db = getFirebaseDb();
  const sessionRef = doc(db, "quizSessions", sessionId);

  const updateData: Partial<QuizSession> = { status };

  if (currentQuestion !== undefined) {
    updateData.currentQuestion = currentQuestion;
  }

  if (status === "finished") {
    updateData.finishedAt = Date.now();
  }

  await updateDoc(sessionRef, updateData);
}

/**
 * セッション状態をリアルタイム監視
 */
export function subscribeToSession(
  sessionId: string,
  callback: (session: QuizSession | null) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const sessionRef = doc(db, "quizSessions", sessionId);

  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as QuizSession);
    } else {
      callback(null);
    }
  });
}

/**
 * ゲストを登録
 */
export async function registerGuest(
  sessionId: string,
  guestId: string,
  nickname: string,
): Promise<void> {
  const db = getFirebaseDb();
  const guestRef = doc(db, "quizSessions", sessionId, "guests", guestId);

  await setDoc(guestRef, {
    guestId,
    nickname,
    registeredAt: Date.now(),
  });
}

/**
 * 回答を送信
 */
export async function submitAnswer(sessionId: string, answer: GuestAnswer): Promise<void> {
  const db = getFirebaseDb();
  const answerRef = doc(
    db,
    "quizSessions",
    sessionId,
    "answers",
    `${answer.guestId}_q${answer.questionNumber}`,
  );

  await setDoc(answerRef, answer);
}

/**
 * 特定の問題の回答をリアルタイム監視
 */
export function subscribeToAnswers(
  sessionId: string,
  callback: (answers: GuestAnswer[]) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const answersRef = collection(db, "quizSessions", sessionId, "answers");

  return onSnapshot(answersRef, (snapshot) => {
    const answers: GuestAnswer[] = [];
    snapshot.forEach((doc) => {
      answers.push(doc.data() as GuestAnswer);
    });
    callback(answers);
  });
}

/**
 * ゲスト数をカウント
 */
export function subscribeToGuestCount(
  sessionId: string,
  callback: (count: number) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const guestsRef = collection(db, "quizSessions", sessionId, "guests");

  return onSnapshot(guestsRef, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * セッション情報を取得（一回のみ）
 */
export async function getSession(sessionId: string): Promise<QuizSession | null> {
  const db = getFirebaseDb();
  const sessionRef = doc(db, "quizSessions", sessionId);
  const snapshot = await getDoc(sessionRef);

  if (snapshot.exists()) {
    return snapshot.data() as QuizSession;
  }

  return null;
}
