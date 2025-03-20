'use server';

import { subscribeToUserRooms } from '@/repository/chat/actions';
import type { ChatRoom } from '@/types/database';

export function subscribeToUserRoomsAction(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void
) {
  return subscribeToUserRooms(userId, onRooms);
}
