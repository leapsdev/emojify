import type { DetailsData } from '../types';

interface EmojiDetailsProps {
  details: DetailsData;
}

export function EmojiDetails({ details }: EmojiDetailsProps) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-4">Detail</h2>

      <div>
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
