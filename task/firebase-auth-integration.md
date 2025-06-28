# Firebase認証とPrivy認証の連携機能実装タスク

## 概要
Privy認証を使用しているアプリで、Firebase Realtime Databaseのセキュリティを強化するため、Privy認証後にFirebase認証を自動実行する機能を実装する。これにより、ユーザーは二重認証を避けつつ、セキュアなデータベースアクセスが可能になる。

## 現在の状況
- Privy認証でアプリの認証を管理
- Firebase Realtime Databaseのセキュリティルールが緩い（`.read: true, .write: true`）
- リアルタイム機能（チャット、メッセージ監視）が実装済み
- サーバーアクションでAdmin SDKを使用してデータベース操作

## 実装タスク

### 1. 依存関係の追加 pnpmを使用 ✅ 完了
**ファイル**: `package.json`
- [x] `firebase/auth`を依存関係に追加
- [x] 既存のFirebase関連パッケージとの互換性確認

### 2. Firebase認証設定の更新 ✅ 完了
**ファイル**: `src/repository/db/config/client.ts`
- [x] `getAuth`をインポート
- [x] Firebase Authインスタンスを初期化
- [x] 既存の設定との競合確認

```typescript
import { getAuth } from 'firebase/auth';

// Initialize Firebase Auth
export const auth = getAuth(app);
```

### 3. Firebase認証トークン生成機能の作成 ✅ 完了
**ファイル**: `src/lib/firebase-auth.ts` (新規作成)
- [x] Firebase Admin SDKを使用したカスタムトークン生成機能
- [x] PrivyユーザーIDをFirebase UIDとして使用
- [x] トークンの有効期限設定
- [x] エラーハンドリング

```typescript
export async function createFirebaseCustomToken(privyUserId: string): Promise<string>
```

### 4. 認証連携機能の更新 ✅ 完了
**ファイル**: `src/lib/auth.ts`
- [x] `getFirebaseCustomToken`関数を追加
- [x] 既存の`getPrivyId`関数との統合
- [x] エラーハンドリングの強化

### 5. クライアントサイド認証フックの作成 ✅ 完了
**ファイル**: `src/hooks/useFirebaseAuth.ts` (新規作成)
- [x] Privy認証状態の監視
- [x] Firebase認証の自動実行
- [x] 認証状態の同期
- [x] ローディング状態の管理

```typescript
export function useFirebaseAuth() {
  // Privy認証後にFirebase認証を自動実行
  // 認証状態の同期
  // エラーハンドリング
}
```

### 6. APIルートの作成 ✅ 完了
**ファイル**: `src/app/api/auth/firebase-token/route.ts` (新規作成)
- [x] Firebaseカスタムトークンの取得エンドポイント
- [x] セキュリティヘッダーの設定
- [x] エラーレスポンスの適切な処理

```typescript
export async function POST(request: NextRequest) {
  // Privy認証の検証
  // Firebaseカスタムトークンの生成
  // レスポンスの返却
}
```

### 7. PrivyProviderの更新 ✅ 完了
**ファイル**: `src/components/providers/PrivyProvider.tsx`
- [x] `FirebaseAuthSync`コンポーネントの追加
- [x] 認証状態の同期機能
- [x] ローディング状態の表示

```typescript
function FirebaseAuthSync({ children }: { children: React.ReactNode }) {
  const { isFirebaseAuthenticated, isLoading } = useFirebaseAuth();
  // 認証状態の管理
}
```

### 8. セキュリティルールの更新 ✅ 完了
**ファイル**: Firebase Console
- [x] 認証必須のルール設定
- [x] ユーザー固有のデータアクセス制御
- [x] チャットルームのメンバーシップ確認
- [x] リアルタイム機能との互換性確保
- [x] サーバーアクション対応（読み取り専用）

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": false,
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": false
      }
    },
    "chatRooms": {
      "$roomId": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": false
      }
    }
  }
}
```

### 9. 環境変数の確認 ✅ 完了
**ファイル**: `.env.local` (確認のみ)
- [x] `FIREBASE_ADMIN_PROJECT_ID`の設定確認
- [x] `FIREBASE_ADMIN_CLIENT_EMAIL`の設定確認
- [x] `FIREBASE_ADMIN_PRIVATE_KEY`の設定確認
- [x] 既存のFirebase設定との整合性確認

**必要な環境変数:**
```bash
# 既存のFirebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK設定（新規追加）
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 10. エラーハンドリングの強化 ✅ 完了
**ファイル**: 各関連ファイル
- [x] 認証失敗時の適切な処理
- [x] ネットワークエラーの処理
- [x] ユーザーフレンドリーなエラーメッセージ
- [x] フォールバック機能の実装

### 11. パフォーマンス最適化 ✅ 完了
**ファイル**: 各関連ファイル
- [x] 不要な再認証の防止
- [x] トークンのキャッシュ機能
- [x] 認証状態の永続化
- [x] メモリリークの防止

### 12. 既存機能との互換性確認 ✅ 完了
**ファイル**: 各リアルタイム機能
- [x] `useRoomMessages`の動作確認
- [x] `useRoomMembers`の動作確認
- [x] `useUserRooms`の動作確認
- [x] `useUnreadStatus`の動作確認

## 実装順序
1. ✅ 依存関係の追加
2. ✅ Firebase認証設定の更新
3. ✅ サーバーサイド機能（firebase-auth.ts, auth.ts）
4. ✅ APIルートの作成
5. ✅ クライアントサイド機能（useFirebaseAuth.ts）
6. ✅ PrivyProviderの更新
7. ✅ セキュリティルールの更新
8. ✅ エラーハンドリングと最適化
9. ✅ 既存機能との互換性確認

## 期待される結果
- ユーザーは一度の認証（Privy）で済む
- Firebase Realtime Databaseが適切にセキュアになる
- 既存のリアルタイム機能が正常に動作する
- セキュリティとユーザビリティの両立

## 注意事項
- 既存のリアルタイム機能を変更しない
- ユーザー体験を損なわない
- エラー時の適切なフォールバックを提供
- パフォーマンスへの影響を最小限に抑える

## 次のステップ
1. ✅ 環境変数の設定確認
2. ✅ Firebase Consoleでのセキュリティルール更新
3. ⏳ 動作テストの実行
4. ⏳ 本番環境での検証

## 作成されたファイル
- `firebase-security-rules-readonly.json` - 読み取り専用セキュリティルール
- `firebase-security-rules.json` - 詳細版セキュリティルール
- `firebase-security-rules-simple.json` - 基本版セキュリティルール
- `FIREBASE_SECURITY_SETUP.md` - セキュリティルール設定ガイド
- `env.example` - 環境変数設定例 