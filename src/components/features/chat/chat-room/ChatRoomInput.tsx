'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { sendMessageAction } from './actions';
import { useEmojiInput } from './hooks/useEmojiInput';

type ChatRoomInputProps = {
  roomId: string;
  walletAddress: string;
};

export function ChatRoomInput({ roomId, walletAddress }: ChatRoomInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    message,
    showEmojiPicker,
    emojiPickerRef,
    inputRef,
    deleteButtonRef,
    handleEmojiClick,
    handleDeleteLastEmoji,
    toggleEmojiPicker,
    clearMessage,
  } = useEmojiInput();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      await sendMessageAction(roomId, walletAddress, trimmedMessage);
      clearMessage();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error && <div className="text-sm text-red-500 px-2">{error}</div>}
        <div className="flex items-center gap-2">
          <EmojiPicker
            message={message}
            showEmojiPicker={showEmojiPicker}
            emojiPickerRef={emojiPickerRef}
            inputRef={inputRef}
            deleteButtonRef={deleteButtonRef}
            onEmojiClick={handleEmojiClick}
            onDeleteLastEmoji={handleDeleteLastEmoji}
            onToggleEmojiPicker={toggleEmojiPicker}
          />
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
