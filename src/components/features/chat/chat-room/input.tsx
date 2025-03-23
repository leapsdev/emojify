'use client';

import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';
import { useState } from 'react';
import { sendMessageAction } from './action';

type ChatRoomInputProps = {
  roomId: string;
  userId: string;
};

export function ChatRoomInput({ roomId, userId }: ChatRoomInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    console.log('Sending message with:', { roomId, userId, message: trimmedMessage });

    try {
      setIsLoading(true);
      setError(null);
      await sendMessageAction(roomId, userId, trimmedMessage);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('メッセージの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error && (
          <div className="text-sm text-red-500 px-2">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="メッセージを入力..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-full py-6 pl-4 pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              disabled={isLoading}
            >
              <Smile className="w-6 h-6" />
            </button>
          </div>
          <button
            type="submit"
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={isLoading}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
