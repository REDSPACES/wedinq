/**
 * Firebase Client SDK初期化
 */

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig, validateFirebaseConfig } from "./config";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

/**
 * Firebase Appを初期化
 */
export function getFirebaseApp(): FirebaseApp {
	if (!validateFirebaseConfig()) {
		throw new Error(
			"Firebase configuration is missing. Please set environment variables.",
		);
	}

	if (!app) {
		const apps = getApps();
		if (apps.length > 0) {
			app = apps[0];
		} else {
			app = initializeApp(firebaseConfig);
		}
	}

	return app;
}

/**
 * Firestoreインスタンスを取得
 */
export function getFirestoreDb(): Firestore {
	if (!db) {
		const firebaseApp = getFirebaseApp();
		db = getFirestore(firebaseApp);
	}
	return db;
}
