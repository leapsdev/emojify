'use client';

import { Input } from '@/components/ui/input';
import { Send, Smile, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { EmojiClickData } from 'emoji-picker-react';
import { Theme } from 'emoji-picker-react';

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
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node) &&
        deleteButtonRef.current &&
        !deleteButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleDeleteLastEmoji = () => {
    setMessage(prevMessage => {
      const lastEmojiMatch = prevMessage.match(/[\p{Emoji}]+$/u);
      if (lastEmojiMatch) {
        return prevMessage.slice(0, -lastEmojiMatch[0].length);
      }
      return prevMessage;
    });
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error && <div className="text-sm text-red-500 px-2">{error}</div>}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <Smile className="w-6 h-6" />
            </button>
            <div className="relative">
              <Input
                type="text"
                placeholder="絵文字を選択してください..."
                value={message}
                className="w-full bg-gray-100 border-none rounded-full py-6 px-4 text-base disabled:text-black disabled:opacity-100"
                disabled={true}
              />
              {message && (
                <button
                  ref={deleteButtonRef}
                  type="button"
                  onClick={handleDeleteLastEmoji}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    setMessage(prevMessage => prevMessage + emojiData.emoji);
                  }}
                  width={350}
                  height={400}
                  theme={Theme.LIGHT}
                  searchPlaceholder="絵文字を検索..."
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
