import { getPrivyId } from '@/lib/auth';
import { getUserRooms } from '@/repository/chat/actions';
import { ChatRoomListPage } from '@/components/pages/chatRoomListPage';

export default async function Page() {
  const userId = await getPrivyId();
  
  if (!userId) {
    throw new Error('ユーザーが認証されていません');
  }

  const rooms = await getUserRooms(userId);
  
  return <ChatRoomListPage initialRooms={rooms} />;
}
