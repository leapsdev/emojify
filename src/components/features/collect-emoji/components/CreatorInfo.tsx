import { Name } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import type { CreatorData } from '../types';

interface CreatorInfoProps {
  creator: CreatorData;
  name: string;
}

export function CreatorInfo({ creator, name }: CreatorInfoProps) {
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <div className="font-semibold truncate max-w-[200px]">
            {creator.id && (
              <Name
                address={`0x${creator.id.replace('0x', '')}` as `0x${string}`}
                chain={base}
              />
            )}
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">{name}</h1>
    </div>
  );
}
