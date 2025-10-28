/**
 * Firebase Admin サーバーサイド設定
 * @description サーバーサイドでFirebase Admin SDKを初期化し、管理者権限でのデータベース操作を提供
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// 環境変数のバリデーション
if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error('FIREBASE_ADMIN_PROJECT_ID environment variable is not set');
}
if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL environment variable is not set');
}
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  throw new Error('FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set');
}

/**
 * Firebase Adminの初期化
 * @description まだ初期化されていない場合のみ初期化を実行
 */
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // private_keyはJSONからの読み込み時に\nが文字列として保存されるため、実際の改行に置換
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, // 明示的にprojectIdを指定
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
    console.log(
      '[Firebase Admin] ✅ Firebase Admin SDK initialized successfully for project:',
      process.env.FIREBASE_ADMIN_PROJECT_ID,
    );
  } catch (error) {
    console.error('[Firebase Admin] ❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Firebase Admin Databaseインスタンス
 * @description 管理者権限でのデータベース操作を提供
 */
export const adminDb = getDatabase();

/**
 * 管理者権限でのデータベース操作用のユーティリティ関数
 * @param path データベースパス
 * @returns Firebase Database Reference
 * @description 指定されたパスへの管理者権限でのデータベース参照を返す
 */
export const adminDbRef = (path: string) => {
  return adminDb.ref(path);
};
