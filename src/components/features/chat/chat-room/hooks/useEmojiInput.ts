import type { EmojiClickData } from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';

export function useEmojiInput() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const isOutsideEmojiPicker = emojiPickerRef.current && !emojiPickerRef.current.contains(target);
      const isOutsideInput = inputRef.current && !inputRef.current.contains(target);
      const isOutsideDeleteButton = deleteButtonRef.current && !deleteButtonRef.current.contains(target);

      if (isOutsideEmojiPicker && isOutsideInput && isOutsideDeleteButton) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      // タッチデバイスとマウスの両方に対応
      document.addEventListener('mousedown', handleOutsideClick, { passive: true });
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
      };
    }
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleDeleteLastEmoji = () => {
    setMessage((prevMessage) => {
      const lastEmojiMatch = prevMessage.match(/[\p{Emoji}]+$/u);
      if (lastEmojiMatch) {
        return prevMessage.slice(0, -lastEmojiMatch[0].length);
      }
      return prevMessage;
    });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const clearMessage = () => {
    setMessage('');
    setShowEmojiPicker(false);
  };

  return {
    message,
    showEmojiPicker,
    emojiPickerRef,
    inputRef,
    deleteButtonRef,
    handleEmojiClick,
    handleDeleteLastEmoji,
    toggleEmojiPicker,
    clearMessage,
  };
}
