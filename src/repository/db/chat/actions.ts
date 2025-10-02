'use server';

import { adminDb } from '@/repository/db/config/server';
import type { ChatRoom, Message } from '@/repository/db/database';
import { DB_INDEXES, DB_PATHS } from '@/repository/db/database';

/**
 * チャットルームの情報とメッセージを取得する
 * @param roomId チャットルームID
 * @returns チャットルーム情報とメッセージ一覧（作成日時昇順でソート）
 * @throws {Error} データベースエラー時（エラーはログに記録され、空の結果を返す）
 */
export async function getChatRoomAction(
  roomId: string,
): Promise<{ room: ChatRoom | null; messages: Message[] }> {
  try {
    // チャットルーム情報を取得
    const roomSnapshot = await adminDb
      .ref(`${DB_PATHS.chatRooms}/${roomId}`)
      .get();
    const room = roomSnapshot.val();
    if (!room) return { room: null, messages: [] };

    // メッセージ一覧を取得
    const messagesIndexSnapshot = await adminDb
      .ref(`${DB_INDEXES.roomMessages}/${roomId}`)
      .get();
    const messageIds = Object.keys(messagesIndexSnapshot.val() || {});

    const messagePromises = messageIds.map((messageId) =>
      adminDb.ref(`${DB_PATHS.messages}/${messageId}`).get(),
    );

    const messageSnapshots = await Promise.all(messagePromises);
    const messages = messageSnapshots
      .map((snapshot) => snapshot.val())
      .filter((message): message is Message => message !== null)
      .sort((a, b) => a.createdAt - b.createdAt);

    return { room, messages };
  } catch (error) {
    console.error('Failed to get chat room:', error);
    return { room: null, messages: [] };
  }
}

/**
 * メッセージを送信する
 * @param roomId チャットルームID
 * @param senderId 送信者のユーザーID（ウォレットアドレス）
 * @param content メッセージ内容
 * @returns 送信されたメッセージID
 * @throws {Error} パラメータが不正な場合、ユーザーまたはルームが存在しない場合、データベースエラー時
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
): Promise<string> {
  // パラメータのバリデーション
  if (!roomId) throw new Error('Room ID is required');
  if (!senderId) throw new Error('Sender ID is required');
  if (!content) throw new Error('Message content is required');

  // ユーザーの存在確認
  const userSnapshot = await adminDb.ref(`${DB_PATHS.users}/${senderId}`).get();
  if (!userSnapshot.exists()) {
    throw new Error(`User not found: ${senderId}`);
  }

  // ルームの存在確認
  const roomSnapshot = await adminDb
    .ref(`${DB_PATHS.chatRooms}/${roomId}`)
    .get();
  if (!roomSnapshot.exists()) {
    throw new Error(`Room not found: ${roomId}`);
  }

  // 新しいスキーマでは、senderIdがウォレットアドレスを表す
  const senderWalletAddress = senderId;

  const newMessageRef = adminDb.ref(DB_PATHS.messages).push();
  const messageId = newMessageRef.key;
  if (!messageId) {
    throw new Error('Failed to generate message ID');
  }
  const now = Date.now();

  const message: Message = {
    id: messageId,
    content,
    senderWalletAddress,
    roomId,
    createdAt: now,
    sent: true,
  };

  await newMessageRef.set(message);

  // ルームの最終メッセージを更新し、送信者の既読状態も更新
  const roomUpdate: Partial<ChatRoom> = {
    lastMessage: {
      content,
      senderWalletAddress,
      createdAt: now,
    },
    updatedAt: now,
    [`members/${senderWalletAddress}/lastReadAt`]: now,
  };

  await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).update(roomUpdate);

  // メッセージインデックスを更新
  await adminDb
    .ref(`${DB_INDEXES.roomMessages}/${roomId}/${messageId}`)
    .set(true);

  return messageId;
}

/**
 * メッセージを既読にする
 * @param roomId チャットルームID
 * @param userId ユーザーID（ウォレットアドレス）
 * @throws {Error} パラメータが不正な場合、ルームまたはユーザーが存在しない場合、データベースエラー時
 */
export async function updateLastReadAction(
  roomId: string,
  userId: string,
): Promise<void> {
  // パラメータのバリデーション
  if (!roomId) throw new Error('Room ID is required');
  if (!userId) throw new Error('User ID is required');

  const now = Date.now();

  // 新しいスキーマでは、userIdがウォレットアドレスを表す
  const walletAddress = userId;

  // ルームとユーザーの存在確認
  const roomRef = adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`);
  const roomSnapshot = await roomRef.get();

  if (!roomSnapshot.exists()) {
    throw new Error(`Room not found: ${roomId}`);
  }

  const room = roomSnapshot.val() as ChatRoom;
  if (!room.members[walletAddress]) {
    throw new Error(`User ${userId} is not a member of room ${roomId}`);
  }

  // 最終既読時刻を更新
  await roomRef.child(`members/${walletAddress}/lastReadAt`).set(now);
}
