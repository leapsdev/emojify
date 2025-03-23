import { ChatRoomPage } from '@/components/pages/chatRoomPage';
import { getUserId } from '@/lib/auth';
import { getChatRoomAction } from '@/repository/chat/actions';
import { notFound } from 'next/navigation';

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// searchParamsは現在使用していないが、Next.jsの型定義上必要
export default async function Page({ params }: PageProps) {
  const { id: roomId } = params;

  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  // チャットルームの情報を取得
  const room = await getChatRoomAction(roomId);
  if (!room) notFound();

  // 相手のユーザー情報を取得
  const otherMemberId = Object.keys(room.members).find((id) => id !== userId);
  if (!otherMemberId) notFound();

  const otherMember = room.members[otherMemberId];
  if (!otherMember) notFound();

  return (
    <ChatRoomPage
      username={otherMember.username}
      roomId={roomId}
      userId={userId}
    />
  );
}
