/**
 * Firebase クライアントサイド設定
 * @description クライアントサイドでFirebaseサービスを初期化し、エクスポートする
 */

import { getAnalytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/**
 * Firebase設定オブジェクト
 * @description 環境変数からFirebaseの設定を読み込む
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebaseアプリインスタンス
 * @description 既存のアプリがある場合は取得、ない場合は初期化
 */
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase Analyticsインスタンス
 * @description ブラウザ環境でのみ初期化（SSR対応）
 */
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * Firebase Authインスタンス
 * @description 認証機能を提供
 */
export const auth = getAuth(app);

/**
 * Firebase Realtime Databaseインスタンス
 * @description リアルタイムデータベース機能を提供
 */
export const db = getDatabase(app);
