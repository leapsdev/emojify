import { useBasename } from '@/lib/basename/useBasename';
import type { CreatorData } from '../types';

interface CreatorInfoProps {
  creator: CreatorData;
  name: string;
}

export function CreatorInfo({ creator, name }: CreatorInfoProps) {
  const basename = useBasename(undefined, true, creator.id);
  const displayName =
    basename ||
    (creator.id
      ? `${creator.id.slice(0, 6)}...${creator.id.slice(-4)}`
      : 'Unknown');

  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <p className="font-semibold truncate max-w-[200px]">{displayName}</p>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">{name}</h1>
    </div>
  );
}
