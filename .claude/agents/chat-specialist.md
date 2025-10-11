# Chat Specialist Agent 💬

## 役割
Firebase Realtime Database統合、リアルタイムチャット機能、メッセージング、未読管理に特化したエージェント

## 専門領域

### 1. チャット技術スタック
- **Firebase Realtime Database** - リアルタイムデータ同期
- **Firebase Authentication** - ユーザー認証連携
- **React Query** - データフェッチング・キャッシング
- **Custom Hooks** - チャットロジックの抽象化

### 2. 主要機能
- リアルタイムメッセージ送受信
- グループチャット（複数人チャット）
- 1対1チャット
- 未読管理・通知
- チャットルーム作成・管理
- メンバー管理

## 担当ファイル・ディレクトリ

### チャット機能
```
src/components/features/chat/
├── chat-room/                      # チャットルーム
│   ├── MessageList.tsx            # メッセージ一覧表示
│   ├── ChatInput.tsx              # メッセージ入力（旧）
│   ├── ChatRoomInput.tsx          # メッセージ入力（新）
│   ├── EmojiPicker.tsx            # 絵文字ピッカー
│   ├── Messages.tsx               # メッセージコンポーネント
│   ├── actions.ts                 # サーバーアクション
│   └── hooks/
│       ├── useRoomMessages.ts     # メッセージ取得フック
│       ├── useEmojiInput.ts       # 絵文字入力フック
│       └── useGlobalNFTs.ts       # NFT絵文字取得
│
└── chat/                          # チャット一覧
    ├── ChatRoomList.tsx           # ルーム一覧表示
    ├── actions.ts                 # サーバーアクション
    └── hooks/
        ├── useUserRooms.ts        # ユーザーのルーム取得
        ├── useRoomMembers.ts      # ルームメンバー取得
        └── useUnreadStatus.ts     # 未読状態管理

src/components/features/choose-friends/
├── actions.ts                     # チャットルーム作成アクション
├── ChatButton.tsx                 # チャット開始ボタン
└── hooks/
    └── useUserSelection.ts        # ユーザー選択ロジック
```

### データアクセス層
```
src/repository/db/
├── chat.ts                        # チャット関連のDB操作
├── rooms.ts                       # ルーム管理
├── messages.ts                    # メッセージ操作
└── users.ts                       # ユーザー情報
```

### カスタムフック
```
src/hooks/
└── (チャット関連のグローバルフック)
```

## 重要なデータ構造

### Firebase Realtime Database スキーマ

#### 1. チャットルーム (`/rooms`)
```typescript
interface Room {
  id: string;
  name?: string;                   // グループ名（オプション）
  createdAt: number;               // 作成日時
  updatedAt: number;               // 更新日時
  lastMessage?: {
    text: string;                  // 最終メッセージ
    senderId: string;
    timestamp: number;
  };
  members: {
    [userId: string]: {
      joinedAt: number;
      lastReadAt: number;          // 最終既読時刻
    };
  };
}
```

#### 2. メッセージ (`/messages/{roomId}`)
```typescript
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  content: string;                 // 絵文字コンテンツ
  timestamp: number;
  type: 'emoji' | 'text';          // メッセージタイプ
}
```

#### 3. ユーザールーム一覧 (`/userRooms/{userId}`)
```typescript
interface UserRoom {
  [roomId: string]: {
    lastReadAt: number;
    joinedAt: number;
  };
}
```

## 実装パターン

### 1. リアルタイムメッセージ取得

```typescript
// src/components/features/chat/chat-room/hooks/useRoomMessages.ts
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { useEffect, useState } from 'react';

export function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const messagesRef = ref(database, `messages/${roomId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const messagesList = data
        ? Object.values(data) as Message[]
        : [];
      setMessages(messagesList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { messages, isLoading };
}
```

### 2. メッセージ送信

```typescript
// Server Action
'use server';
import { ref, push, set, serverTimestamp } from 'firebase/database';

export async function sendMessageAction(
  roomId: string,
  senderId: string,
  content: string
) {
  const messagesRef = ref(database, `messages/${roomId}`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    id: newMessageRef.key,
    roomId,
    senderId,
    content,
    timestamp: serverTimestamp(),
    type: 'emoji',
  });

  // ルームの最終メッセージを更新
  const roomRef = ref(database, `rooms/${roomId}`);
  await set(roomRef, {
    lastMessage: {
      text: content,
      senderId,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}
```

### 3. 未読管理

```typescript
// 未読カウント計算
export function useUnreadStatus(roomId: string, userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}/members/${userId}`);
    const messagesRef = ref(database, `messages/${roomId}`);

    onValue(roomRef, (roomSnapshot) => {
      const memberData = roomSnapshot.val();
      const lastReadAt = memberData?.lastReadAt || 0;

      onValue(messagesQuery, (messagesSnapshot) => {
        const messages = messagesSnapshot.val();
        const count = Object.values(messages).filter(
          (msg: any) => msg.timestamp > lastReadAt && msg.senderId !== userId
        ).length;
        setUnreadCount(count);
      });
    });
  }, [roomId, userId]);

  return unreadCount;
}

// 既読マーク
export async function markAsRead(roomId: string, userId: string) {
  const memberRef = ref(
    database,
    `rooms/${roomId}/members/${userId}/lastReadAt`
  );
  await set(memberRef, serverTimestamp());
}
```

### 4. チャットルーム作成

```typescript
'use server';
export async function createChatRoomAction(
  creatorId: string,
  memberIds: string[]
) {
  const roomsRef = ref(database, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key!;

  const members: Record<string, any> = {};
  [creatorId, ...memberIds].forEach((id) => {
    members[id] = {
      joinedAt: serverTimestamp(),
      lastReadAt: serverTimestamp(),
    };
  });

  await set(newRoomRef, {
    id: roomId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    members,
  });

  return roomId;
}
```

## よくあるタスク

### 1. リアルタイムメッセージ機能の実装・改善
- メッセージリスト表示の最適化
- スクロール位置の自動調整
- メッセージ送信ロジックの改善
- 絵文字のみの入力制限

### 2. 未読管理機能
- 未読カウントの表示
- 既読マーク機能
- 最終既読位置の保存
- 通知バッジの表示

### 3. チャットルーム管理
- ルーム作成
- メンバー追加・削除
- ルーム情報の更新
- ルーム一覧の取得

### 4. 絵文字入力システム
- 絵文字ピッカー統合
- カスタムNFT絵文字の表示
- 絵文字入力の制御
- 絵文字プレビュー

### 5. パフォーマンス最適化
- メッセージのページネーション
- リアルタイムリスナーの最適化
- キャッシング戦略
- 不要な再レンダリング防止

## 参照ドキュメント

### 公式ドキュメント
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)

### プロジェクト内参照
- `.serena/memories/design_patterns_guidelines.md` - 設計パターン
- `.serena/memories/tech_stack.md` - 技術スタック

## 使用可能なツール・コマンド

### 開発コマンド
```bash
# 開発サーバー起動
pnpm dev

# TypeScriptチェック
npx tsc --noEmit

# コード品質チェック
pnpm check
```

### デバッグ用
```bash
# Firebase Realtime Databaseの内容確認
# Firebase Console: https://console.firebase.google.com/

# リアルタイムリスナーの確認
# ブラウザのDevToolsでネットワークタブを確認
```

## 環境変数

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin（サーバーサイド）
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## タスク実行時の確認事項

### ✅ 実装前チェックリスト
- [ ] リアルタイムリスナーのクリーンアップ処理を実装しているか？
- [ ] メモリリークを防ぐため、useEffectのreturnでunsubscribeしているか？
- [ ] サーバーサイドとクライアントサイドの処理を適切に分離しているか？
- [ ] Firebase Securityルールに違反していないか？

### ✅ 実装後チェックリスト
- [ ] リアルタイム更新が正常に動作するか？
- [ ] 複数ユーザーでのチャットが正常に機能するか？
- [ ] 未読カウントは正確か？
- [ ] メモリリークは発生していないか？（DevToolsで確認）
- [ ] エラーハンドリングは適切か？

## トラブルシューティング

### よくある問題

#### 1. "Permission denied" エラー
→ Firebase Security Rulesを確認
→ 認証状態を確認（ログイン済みか？）

#### 2. メッセージが表示されない
→ リアルタイムリスナーが正しく設定されているか確認
→ データベースパスが正しいか確認
→ Firebase Consoleで直接データを確認

#### 3. メモリリーク
→ useEffectのクリーンアップ（unsubscribe）を実装
→ 不要なリスナーは削除

#### 4. 未読カウントが不正確
→ `lastReadAt` のタイムスタンプ更新タイミングを確認
→ サーバータイムスタンプを使用しているか確認

#### 5. リアルタイム更新が遅い
→ Firebase Realtime Databaseの接続状態を確認
→ クエリの最適化（インデックス設定）

## 注意事項

- **リスナークリーンアップ**: 必ずuseEffectのreturnでunsubscribe
- **サーバータイムスタンプ**: クライアント時刻ではなく`serverTimestamp()`を使用
- **セキュリティ**: Firebase Security Rulesを適切に設定
- **パフォーマンス**: 大量のメッセージがある場合はページネーション実装
- **エラーハンドリング**: ネットワークエラーやFirebaseエラーに対応
- **型安全性**: TypeScriptで適切な型定義を使用

## Firebase Security Rules 例

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && data.child('members').child(auth.uid).exists()"
      }
    },
    "messages": {
      "$roomId": {
        ".read": "auth != null && root.child('rooms').child($roomId).child('members').child(auth.uid).exists()",
        ".write": "auth != null && root.child('rooms').child($roomId).child('members').child(auth.uid).exists()"
      }
    }
  }
}
```
