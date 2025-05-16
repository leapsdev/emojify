'use client';

import { useWallet } from '@/components/features/create-emoji/hooks/useWallet';
import { useProfileNFTs } from '@/components/features/profile/hooks/useProfileNFTs';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Categories } from 'emoji-picker-react';
import Image from 'next/image';
import { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { sendMessageAction } from './actions';
import { useEmojiInput } from './hooks/useEmojiInput';

interface NFT {
  tokenId: string;
  owner: string;
  uri: string;
  imageUrl?: string;
  name?: string;
  description?: string;
}

type ChatRoomInputProps = {
  roomId: string;
  userId: string;
};

function ChatRoomInputContent({ roomId, userId }: ChatRoomInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedWalletAddress } = useWallet();
  const { nfts } = useProfileNFTs(selectedWalletAddress);

  // NFTをカスタム絵文字として変換
  const customEmojis = nfts
    .filter((nft: NFT) => nft.name && nft.imageUrl) // nullやundefinedを除外
    .map((nft: NFT) => ({
      id: `nft-${nft.tokenId}`, // プレフィックスを追加して一意のIDを生成
      names: [nft.name || `NFT #${nft.tokenId}`, `nft-${nft.tokenId}`],
      imgUrl: nft.imageUrl || '',
    }));

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

    console.log('Sending message with:', {
      roomId,
      userId,
      message: trimmedMessage,
    });

    try {
      setIsLoading(true);
      setError(null);
      await sendMessageAction(roomId, userId, trimmedMessage);
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
            customEmojis={customEmojis}
            categories={[
              { category: Categories.CUSTOM, name: 'My NFTs' },
              { category: Categories.SMILEYS_PEOPLE, name: 'Faces' },
              { category: Categories.ANIMALS_NATURE, name: 'Animals & Nature' },
              { category: Categories.FOOD_DRINK, name: 'Food & Drink' },
              { category: Categories.ACTIVITIES, name: 'Activities' },
              { category: Categories.TRAVEL_PLACES, name: 'Travel & Places' },
              { category: Categories.OBJECTS, name: 'Objects' },
              { category: Categories.SYMBOLS, name: 'Symbols' },
              { category: Categories.FLAGS, name: 'Flags' },
            ]}
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
            <Image
              src="/paper-plane-icon.png"
              alt="Send"
              width={28}
              height={28}
            />
          </button>
        </div>
      </form>
    </div>
  );
}

export function ChatRoomInput(props: ChatRoomInputProps) {
  return (
    <ThirdwebProvider
      activeChain="base"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      supportedWallets={[]}
    >
      <ChatRoomInputContent {...props} />
    </ThirdwebProvider>
  );
}
