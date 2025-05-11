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

  console.log(room);

  // 相手のユーザー情報を取得
  const otherMembers = Object.entries(room.members)
    .filter(([id]) => id !== userId)
    .map(([, member]) => member);

  if (otherMembers.length === 0) notFound();

  // ヘッダーに表示するユーザー名を生成
  const headerTitle = otherMembers.map((member) => member.username).join(', ');

  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <div className="max-w-[320px] w-full text-center">
            <h1 className="font-semibold truncate">{headerTitle}</h1>
          </div>
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
