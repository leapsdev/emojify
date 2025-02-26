import { ChatRoomPage } from '@/components/pages/chatRoomPage';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ChatRoomPage username={resolvedParams.id} />;
}
