import { LinkButton } from '@/components/ui/linkButton';

type ChatRoomHeaderProps = {
  username: string;
};

export const ChatRoomHeader = ({ username }: ChatRoomHeaderProps) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <LinkButton href="/chat" content="👈" />
      <h1 className="text-xl font-semibold flex-1 text-center mr-8">
        {username}
      </h1>
    </div>
  );
};
