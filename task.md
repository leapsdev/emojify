# Farcaster認証統合とデータベーススキーマ変更タスク

## プロジェクト概要

Emoji Chatは、Firebase Realtime Databaseを使用したリアルタイムチャットアプリケーションです。現在Privy認証システムが実装されており、新たにFarcaster認証が追加されました。

## 現在の状況

### 認証システム
- **Privy認証**: 既に実装済み
- **Farcaster認証**: 新たに追加済み
- **統合認証プロバイダー**: `AuthProvider`で両方の認証方式を同時提供

### 現在のデータベーススキーマ
- **ユーザーテーブル**: Privy IDをユーザーIDとして使用
- **メッセージテーブル**: `senderId`（ユーザーID）で送信者を管理
- **チャットルーム**: メンバー情報にユーザーIDを使用

## 必要な変更

### 1. ユーザーテーブルのID変更

**現在の実装:**
```typescript
interface User {
  id: string; // Privy IDのみ
  // ... その他のフィールド
}
```

**変更後:**
```typescript
interface User {
  id: string; // Privy ID または Farcaster ID
  authProvider: 'privy' | 'farcaster'; // 認証プロバイダーを追加
  // ... その他のフィールド
}
```

**実装箇所:**
- `src/repository/db/database.ts` - Userインターフェース
- `src/repository/db/user/schema.ts` - Zodスキーマ
- `src/repository/db/user/actions.ts` - ユーザー作成・取得関数

### 2. メッセージテーブルの変更

**現在の実装:**
```typescript
interface Message {
  id: string;
  content: string;
  senderId: string; // ユーザーID
  roomId: string;
  createdAt: number;
  sent: boolean;
}
```

**変更後:**
```typescript
interface Message {
  id: string;
  content: string;
  senderWalletAddress: string; // ウォレットアドレス
  roomId: string;
  createdAt: number;
  sent: boolean;
}
```

**実装箇所:**
- `src/repository/db/database.ts` - Messageインターフェース
- `src/repository/db/chat/actions.ts` - メッセージ送信・取得関数
- メッセージ表示コンポーネント

### 3. チャットルームの変更

**現在の実装:**
```typescript
interface ChatRoom {
  id: string;
  members: Record<string, {
    joinedAt: number;
    username: string;
    lastReadAt: number;
    imageUrl?: string | null;
  }>;
  // ...
}
```

**変更後:**
```typescript
interface ChatRoom {
  id: string;
  members: Record<string, { // キーはウォレットアドレス
    joinedAt: number;
    username: string;
    lastReadAt: number;
    imageUrl?: string | null;
    userId: string; // ユーザーIDを追加（表示用）
  }>;
  // ...
}
```

## 実装タスク

### Phase 1: データベーススキーマの更新

1. **Userインターフェースの更新**
   - `authProvider`フィールドの追加
   - コメントの更新

2. **Messageインターフェースの更新**
   - `senderId`を`senderWalletAddress`に変更
   - 関連する型定義の更新

3. **ChatRoomインターフェースの更新**
   - メンバーキーをウォレットアドレスに変更
   - `userId`フィールドの追加

### Phase 2: データベースアクション関数の更新

1. **ユーザー関連関数の更新**
   - `createUser`関数で`authProvider`を設定
   - `getUser`関数の更新
   - Farcaster IDの処理追加

2. **メッセージ関連関数の更新**
   - `sendMessage`関数でウォレットアドレスを使用
   - メッセージ取得関数の更新
   - ウォレットアドレスからユーザー情報を取得する関数の追加

3. **チャットルーム関連関数の更新**
   - ルーム作成・参加関数の更新
   - メンバー管理関数の更新

### Phase 3: フロントエンドコンポーネントの更新

1. **認証関連コンポーネント**
   - Farcaster認証時のユーザー作成処理
   - 認証プロバイダーの判定ロジック

2. **チャット関連コンポーネント**
   - メッセージ表示の更新
   - 送信者情報の取得方法変更

3. **プロフィール関連コンポーネント**
   - ウォレットアドレス表示の更新
   - ユーザー情報の取得方法変更

### Phase 4: データ移行

1. **既存データの移行**
   - 既存のユーザーデータに`authProvider`を追加
   - 既存のメッセージデータの`senderId`をウォレットアドレスに変換
   - 既存のチャットルームデータのメンバーキーを更新

2. **データ整合性の確認**
   - 移行後のデータ検証
   - エラーハンドリングの追加

## 技術的考慮事項

### 1. ウォレットアドレスの取得
- Privyユーザー: `getWalletAddresses`関数を使用
- Farcasterユーザー: Farcaster SDKからウォレットアドレスを取得

### 2. ユーザーIDの管理
- Privy: そのまま使用
- Farcaster: `farcaster_${fid}`形式で使用

### 3. データベースクエリの最適化
- ウォレットアドレスでのインデックス作成
- ユーザー情報の効率的な取得

### 4. エラーハンドリング
- ウォレットアドレスが取得できない場合の処理
- 認証プロバイダーの判定エラー

## 影響範囲

### 変更が必要なファイル
- `src/repository/db/database.ts`
- `src/repository/db/user/schema.ts`
- `src/repository/db/user/actions.ts`
- `src/repository/db/chat/actions.ts`
- `src/components/features/chat/` (全ファイル)
- `src/components/features/profile/` (全ファイル)
- `src/hooks/useFirebaseAuth.ts`
- `src/hooks/useFarcasterAuth.ts`

### 新規作成が必要なファイル
- `src/repository/db/migration/` (データ移行スクリプト)
- `src/lib/wallet-utils.ts` (ウォレットアドレス関連ユーティリティ)

## 完了条件

- [ ] ユーザーテーブルでPrivy IDとFarcaster IDをそのまま使用
- [ ] メッセージテーブルでウォレットアドレスを使用
- [ ] ユーザーIDとの紐付けを削除
- [ ] 既存データの移行完了
- [ ] 全機能の動作確認

## 注意事項

1. **データ移行の安全性**
   - バックアップの作成

2. **パフォーマンス**
   - ウォレットアドレスでのクエリ最適化
   - インデックスの適切な設定

3. **セキュリティ**
   - ウォレットアドレスの検証
   - 認証トークンの適切な処理

このタスクは段階的に実装し、各段階でテストを行いながら進めることを推奨します。
