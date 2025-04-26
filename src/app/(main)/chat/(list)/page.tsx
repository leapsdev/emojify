import { ChatRoomListPage } from '@/components/pages/chatRoomListPage';
import { getPrivyId } from '@/lib/auth';
import { getUserRooms } from '@/repository/chat/actions';
import { redirect } from 'next/navigation';

export default async function Page() {
  const userId = await getPrivyId();
  if (!userId) {
    redirect('/');
  }

  const rooms = await getUserRooms(userId);
  if (!rooms) {
    redirect('/');
  }

  return <ChatRoomListPage userId={userId} initialRooms={rooms} />;
}
