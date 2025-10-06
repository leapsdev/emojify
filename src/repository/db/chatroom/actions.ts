'use server';

import { adminDb } from '@/repository/db/config/server';
import type { ChatRoom } from '@/repository/db/database';
import { DB_INDEXES, DB_PATHS } from '@/repository/db/database';

/**
 * 新しいチャットルームを作成する
 * @param members メンバーのウォレットアドレス配列
 * @returns 作成されたチャットルームID
 * @throws {Error} ルームID生成失敗時、メンバーが存在しない場合、データベースエラー時
 */
export async function createChatRoom(members: string[]): Promise<string> {
  const newRoomRef = adminDb.ref(DB_PATHS.chatRooms).push();
  const roomId = newRoomRef.key;
  if (!roomId) {
    throw new Error('Failed to generate room ID');
  }

  const membersRecord: Record<
    string,
    { joinedAt: number; lastReadAt: number }
  > = {};
  const now = Date.now();

  // メンバーの情報を直接設定（ユーザー存在確認は不要）
  members.forEach((walletAddress) => {
    membersRecord[walletAddress] = {
      joinedAt: now,
      lastReadAt: now,
    };
  });

  const newRoom: ChatRoom = {
    id: roomId,
    members: membersRecord,
    createdAt: now,
    updatedAt: now,
  };

  await newRoomRef.set(newRoom);

  // ユーザーのルームインデックスを更新
  const updates: Record<string, boolean> = {};
  members.forEach((memberId) => {
    updates[`${DB_INDEXES.userRooms}/${memberId}/${roomId}`] = true;
  });

  await adminDb.ref().update(updates);
  return roomId;
}

/**
 * ユーザーのチャットルーム一覧を取得する
 * @param walletAddress ウォレットアドレス
 * @returns ユーザーが参加しているチャットルーム一覧（更新日時降順でソート）
 * @throws {Error} データベースエラー時
 */
export async function getUserRooms(walletAddress: string): Promise<ChatRoom[]> {
  console.log('[getUserRooms] 開始:', {
    walletAddress,
    timestamp: new Date().toISOString(),
  });

  try {
    const userRoomsSnapshot = await adminDb
      .ref(`${DB_INDEXES.userRooms}/${walletAddress}`)
      .get();
    const userRooms = userRoomsSnapshot.val() || {};
    const roomIds = Object.keys(userRooms);

    console.log('[getUserRooms] ユーザーのルームID取得完了:', {
      roomIdsCount: roomIds.length,
      roomIds,
    });

    const rooms: ChatRoom[] = [];
    for (const roomId of roomIds) {
      const roomSnapshot = await adminDb
        .ref(`${DB_PATHS.chatRooms}/${roomId}`)
        .get();
      const room = roomSnapshot.val() as ChatRoom;
      if (room) {
        rooms.push(room);
      }
    }

    const result = rooms.sort((a, b) => b.updatedAt - a.updatedAt);

    console.log('[getUserRooms] 完了:', {
      roomsCount: result.length,
    });

    return result;
  } catch (error) {
    console.error('[getUserRooms] エラー発生:', {
      error,
      walletAddress,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * チャットルームにメンバーを追加する
 * @param roomId チャットルームID
 * @param walletAddress 追加するウォレットアドレス
 * @throws {Error} ユーザーが存在しない場合、データベースエラー時
 */
export async function addRoomMember(
  roomId: string,
  walletAddress: string,
): Promise<void> {
  const updates: Record<
    string,
    { joinedAt: number; lastReadAt: number } | boolean
  > = {};
  const now = Date.now();

  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${walletAddress}`] = {
    joinedAt: now,
    lastReadAt: now,
  };

  // ユーザーのルームインデックスを更新
  updates[`${DB_INDEXES.userRooms}/${walletAddress}/${roomId}`] = true;

  await adminDb.ref().update(updates);
}

/**
 * チャットルームからメンバーを削除する
 * @param roomId チャットルームID
 * @param walletAddress 削除するウォレットアドレス
 * @throws {Error} データベースエラー時
 */
export async function removeRoomMember(
  roomId: string,
  walletAddress: string,
): Promise<void> {
  const updates: Record<string, null> = {};

  // ルームのメンバーリストから削除
  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${walletAddress}`] = null;

  // ユーザーのルームインデックスから削除
  updates[`${DB_INDEXES.userRooms}/${walletAddress}/${roomId}`] = null;

  await adminDb.ref().update(updates);
}

/**
 * チャットルームを削除する
 * @param roomId チャットルームID
 * @throws {Error} データベースエラー時
 * @description ルームとメンバーのインデックス、メッセージインデックスも同時に削除
 */
export async function deleteChatRoom(roomId: string): Promise<void> {
  // ルームのメンバー一覧を取得
  const roomSnapshot = await adminDb
    .ref(`${DB_PATHS.chatRooms}/${roomId}`)
    .get();
  const room = roomSnapshot.val() as ChatRoom;

  if (!room) return;

  const updates: Record<string, null> = {};

  // 各メンバーのインデックスからルームを削除
  Object.keys(room.members).forEach((memberId) => {
    updates[`${DB_INDEXES.userRooms}/${memberId}/${roomId}`] = null;
  });

  // ルーム自体を削除
  updates[`${DB_PATHS.chatRooms}/${roomId}`] = null;

  // ルームのメッセージインデックスを削除
  updates[`${DB_INDEXES.roomMessages}/${roomId}`] = null;

  await adminDb.ref().update(updates);
}

/**
 * メンバーが完全一致するチャットルームを検索する
 * @param members 検索対象のメンバーID配列（ウォレットアドレス）
 * @returns 完全一致するチャットルーム、存在しない場合はnull
 * @throws {Error} データベースエラー時
 * @description メンバーの数と構成が完全に一致するルームを検索
 */
export async function findChatRoomByMembers(
  members: string[],
): Promise<ChatRoom | null> {
  // 新しいスキーマでは、membersがウォレットアドレスを表す
  const memberSet = new Set(members);

  // 最初のメンバーのチャットルーム一覧を取得
  const firstMemberRooms = await getUserRooms(members[0]);

  // メンバーが完全一致するルームを検索
  return (
    firstMemberRooms.find((room) => {
      const roomMembers = Object.keys(room.members);
      return (
        roomMembers.length === memberSet.size &&
        roomMembers.every((walletAddress) => memberSet.has(walletAddress))
      );
    }) ?? null
  );
}
