import { ChatRoomListPage } from '@/components/pages/chatRoomListPage';
import { getPrivyId } from '@/lib/auth';
import { getUserRooms } from '@/repository/chat/actions';

export default async function Page() {
  const userId = await getPrivyId();

  if (!userId) {
    throw new Error('ユーザーが認証されていません');
  }

  const rooms = await getUserRooms(userId);

  return <ChatRoomListPage initialRooms={rooms} />;
}
