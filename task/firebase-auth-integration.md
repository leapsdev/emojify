# Firebase認証とPrivy認証の連携機能実装タスク

## 概要
Privy認証を使用しているアプリで、Firebase Realtime Databaseのセキュリティを強化するため、Privy認証後にFirebase認証を自動実行する機能を実装する。これにより、ユーザーは二重認証を避けつつ、セキュアなデータベースアクセスが可能になる。

## 現在の状況
- Privy認証でアプリの認証を管理
- Firebase Realtime Databaseのセキュリティルールが緩い（`.read: true, .write: true`）
- リアルタイム機能（チャット、メッセージ監視）が実装済み
- サーバーアクションでAdmin SDKを使用してデータベース操作

## 実装タスク

### 1. 依存関係の追加 pnpmを使用
**ファイル**: `package.json`
- [ ] `firebase/auth`を依存関係に追加
- [ ] 既存のFirebase関連パッケージとの互換性確認

### 2. Firebase認証設定の更新
**ファイル**: `src/repository/db/config/client.ts`
- [ ] `getAuth`をインポート
- [ ] Firebase Authインスタンスを初期化
- [ ] 既存の設定との競合確認

```typescript
import { getAuth } from 'firebase/auth';

// Initialize Firebase Auth
export const auth = getAuth(app);
```

### 3. Firebase認証トークン生成機能の作成
**ファイル**: `src/lib/firebase-auth.ts` (新規作成)
- [ ] Firebase Admin SDKを使用したカスタムトークン生成機能
- [ ] PrivyユーザーIDをFirebase UIDとして使用
- [ ] トークンの有効期限設定
- [ ] エラーハンドリング

```typescript
export async function createFirebaseCustomToken(privyUserId: string): Promise<string>
```

### 4. 認証連携機能の更新
**ファイル**: `src/lib/auth.ts`
- [ ] `getFirebaseCustomToken`関数を追加
- [ ] 既存の`getPrivyId`関数との統合
- [ ] エラーハンドリングの強化

### 5. クライアントサイド認証フックの作成
**ファイル**: `src/hooks/useFirebaseAuth.ts` (新規作成)
- [ ] Privy認証状態の監視
- [ ] Firebase認証の自動実行
- [ ] 認証状態の同期
- [ ] ローディング状態の管理

```typescript
export function useFirebaseAuth() {
  // Privy認証後にFirebase認証を自動実行
  // 認証状態の同期
  // エラーハンドリング
}
```

### 6. APIルートの作成
**ファイル**: `src/app/api/auth/firebase-token/route.ts` (新規作成)
- [ ] Firebaseカスタムトークンの取得エンドポイント
- [ ] セキュリティヘッダーの設定
- [ ] エラーレスポンスの適切な処理

```typescript
export async function POST(request: NextRequest) {
  // Privy認証の検証
  // Firebaseカスタムトークンの生成
  // レスポンスの返却
}
```

### 7. PrivyProviderの更新
**ファイル**: `src/components/providers/PrivyProvider.tsx`
- [ ] `FirebaseAuthSync`コンポーネントの追加
- [ ] 認証状態の同期機能
- [ ] ローディング状態の表示

```typescript
function FirebaseAuthSync({ children }: { children: React.ReactNode }) {
  const { isFirebaseAuthenticated, isLoading } = useFirebaseAuth();
  // 認証状態の管理
}
```

### 8. セキュリティルールの更新
**ファイル**: Firebase Console
- [ ] 認証必須のルール設定
- [ ] ユーザー固有のデータアクセス制御
- [ ] チャットルームのメンバーシップ確認
- [ ] リアルタイム機能との互換性確保

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "chatRooms": {
      "$roomId": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && data.child('members').child(auth.uid).exists()"
      }
    }
  }
}
```

### 9. 環境変数の確認
**ファイル**: `.env.local` (確認のみ)
- [ ] `FIREBASE_ADMIN_PROJECT_ID`の設定確認
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`の設定確認
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`の設定確認
- [ ] 既存のFirebase設定との整合性確認

### 10. エラーハンドリングの強化
**ファイル**: 各関連ファイル
- [ ] 認証失敗時の適切な処理
- [ ] ネットワークエラーの処理
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] フォールバック機能の実装

### 11. パフォーマンス最適化
**ファイル**: 各関連ファイル
- [ ] 不要な再認証の防止
- [ ] トークンのキャッシュ機能
- [ ] 認証状態の永続化
- [ ] メモリリークの防止

### 12. 既存機能との互換性確認
**ファイル**: 各リアルタイム機能
- [ ] `useRoomMessages`の動作確認
- [ ] `useRoomMembers`の動作確認
- [ ] `useUserRooms`の動作確認
- [ ] `useUnreadStatus`の動作確認

## 実装順序
1. 依存関係の追加
2. Firebase認証設定の更新
3. サーバーサイド機能（firebase-auth.ts, auth.ts）
4. APIルートの作成
5. クライアントサイド機能（useFirebaseAuth.ts）
6. PrivyProviderの更新
7. セキュリティルールの更新
8. エラーハンドリングと最適化
9. 既存機能との互換性確認

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