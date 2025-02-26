import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';

type ChatRoomInputProps = {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const ChatRoomInput = ({ message, onMessageChange, onSubmit }: ChatRoomInputProps) => {
  return (
    <div className="p-4">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Emoji..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-full py-6 pl-4 pr-12"
          />
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Smile className="w-6 h-6" />
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded-full flex items-center justify-center"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
