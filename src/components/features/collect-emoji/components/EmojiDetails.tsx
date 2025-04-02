import Image from 'next/image';
import type { EmojiData } from '../types';

interface Props {
  emoji: EmojiData;
}

export function EmojiDetails({ emoji }: Props) {
  const { details } = emoji;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-4">Detail</h2>

      <div>
        {/* First Collector */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-gray-700 text-lg">First Collector</span>
          <div className="flex items-center gap-2">
            <Image
              src={details.firstCollectorAvatar || '/placeholder.svg'}
              alt="First Collector"
              width={32}
              height={32}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium">{details.firstCollector}</span>
          </div>
        </div>

        {/* Token */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-gray-700 text-lg">Token</span>
          <span className="font-medium">{details.token}</span>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-gray-700 text-lg">Network</span>
          <span className="font-medium">{details.network}</span>
        </div>
      </div>
    </div>
  );
}
