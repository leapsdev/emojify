'use server';

import { subscribeToUserRooms } from '@/repository/chat/actions';
import type { ChatRoom } from '@/types/database';

export async function subscribeToUserRoomsAction(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void
): Promise<() => void> {
  return subscribeToUserRooms(userId, onRooms);
}
