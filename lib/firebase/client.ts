/**
 * Firebase Client SDK初期化
 * クライアントサイドで使用
 */

import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let db: Firestore;

/**
 * Firebase Appを初期化または取得
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

/**
 * Firestoreインスタンスを取得
 */
export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
