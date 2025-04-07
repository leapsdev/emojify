'use client';

import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { EmojiClickData } from 'emoji-picker-react';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);
import { sendMessageAction } from './actions';

type ChatRoomInputProps = {
  roomId: string;
  userId: string;
};

export function ChatRoomInput({ roomId, userId }: ChatRoomInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    console.log('Sending message with:', {
      roomId,
      userId,
      message: trimmedMessage,
    });

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
        {error && <div className="text-sm text-red-500 px-2">{error}</div>}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <Smile className="w-6 h-6" />
            </button>
            <Input
              type="text"
              placeholder="絵文字を選択してください..."
              value={message}
              className={`w-full bg-gray-100 border-none rounded-full py-6 px-4 text-base ${isLoading ? 'opacity-50' : ''}`}
              disabled={true}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setMessage(emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
                width={350}
                height={400}
              />
              </div>
            )}
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
