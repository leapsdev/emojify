import { ChatRoomPage } from '@/components/pages/ChatRoomPage';
import { Header } from '@/components/shared/layout/Header';
import { getUserId } from '@/lib/auth';
import { getChatRoomAction } from '@/repository/chat/actions';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const roomId = (await params).id;

  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  // チャットルームの情報とメッセージを取得
  const { room, messages } = await getChatRoomAction(roomId);
  if (!room) notFound();

  // 相手のユーザー情報を取得
  const otherMemberId = Object.keys(room.members).find((id) => id !== userId);
  if (!otherMemberId) notFound();

  const otherMember = room.members[otherMemberId];
  if (!otherMember) notFound();

  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <h1 className="text-xl font-semibold">{otherMember.username}</h1>
        }
      />
      <ChatRoomPage
        roomId={roomId}
        userId={userId}
        initialMessages={messages}
      />
    </>
  );
}
