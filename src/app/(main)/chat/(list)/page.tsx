import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
import { getPrivyId } from '@/lib/auth';
import { getUserRooms } from '@/repository/db/chat/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function Page() {
  const userId = await getPrivyId();
  if (!userId) {
    console.log('userId not found');
    redirect('/');
  }

  const rooms = await getUserRooms(userId);
  if (!rooms) {
    redirect('/');
  }

  return <ChatRoomListPage userId={userId} initialRooms={rooms} />;
}
