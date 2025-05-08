import { type Categories, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const EmojiPickerComponent = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
});

type CustomEmoji = {
  id: string;
  names: string[];
  imgUrl: string;
};

type EmojiPickerProps = {
  message: string;
  showEmojiPicker: boolean;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  deleteButtonRef: React.RefObject<HTMLButtonElement | null>;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onDeleteLastEmoji: () => void;
  onToggleEmojiPicker: () => void;
  customEmojis?: CustomEmoji[];
  categories?: Array<{
    category: Categories;
    name: string;
  }>;
};

export function EmojiPicker({
  message,
  showEmojiPicker,
  emojiPickerRef,
  inputRef,
  deleteButtonRef,
  onEmojiClick,
  onDeleteLastEmoji,
  onToggleEmojiPicker,
  customEmojis = [],
  categories,
}: EmojiPickerProps) {
  // メッセージをNFTと絵文字に分割
  const parts = message.split(/(nft-\d+)/).filter(Boolean);

  return (
    <div className="flex-1 relative">
      <div className="relative w-full">
        <div
          ref={inputRef}
          onClick={onToggleEmojiPicker}
          className="w-full h-12 bg-gray-100 border-none rounded-full px-4 text-2xl leading-none cursor-pointer focus:outline-none flex items-center gap-1"
        >
          {parts.length > 0 ? (
            <div className="flex items-center gap-1">
              {parts.map((part, index) => {
                const nftMatch = part.match(/nft-(\d+)/);
                if (nftMatch) {
                  const selectedNFT = customEmojis.find(
                    (emoji) => emoji.id === nftMatch[0],
                  );
                  if (selectedNFT) {
                    return (
                      <div key={index} className="flex items-center">
                        <Image
                          src={selectedNFT.imgUrl}
                          alt={selectedNFT.names[0]}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                    );
                  }
                }
                return (
                  <span key={index} className="text-2xl">
                    {part}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-base text-gray-500">
              Click to select emojis...
            </span>
          )}
        </div>
        {message && (
          <button
            ref={deleteButtonRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteLastEmoji();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="fixed inset-x-4 bottom-24 z-50 bg-white rounded-lg shadow-lg md:absolute md:inset-x-auto md:bottom-full md:right-0 md:mb-2"
        >
          <div className="max-w-[95vw] w-full md:w-[350px]">
            <EmojiPickerComponent
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              width="100%"
              height={350}
              theme={Theme.LIGHT}
              searchDisabled={true}
              customEmojis={customEmojis}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
