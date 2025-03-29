import { Header } from '@/components/shared/layout/header';

type ChatRoomHeaderProps = {
  username: string;
};

export const ChatRoomHeader = ({ username }: ChatRoomHeaderProps) => {
  return (
    <Header
      backHref="/chat"
      centerContent={<h1 className="text-xl font-semibold">{username}</h1>}
    />
  );
};
