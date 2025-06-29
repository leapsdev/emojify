import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Firebase Adminの初期化（まだ初期化されていない場合のみ）
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // private_keyはJSONからの読み込み時に\nが文字列として保存されるため、実際の改行に置換
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

// データベースのインスタンスをエクスポート
export const adminDb = getDatabase();

// 管理者権限でのデータベース操作用のユーティリティ関数
export const adminDbRef = (path: string) => {
  return adminDb.ref(path);
};
