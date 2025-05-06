import { Button } from '@/components/ui/Button';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
  tokenId: string;
}

export function CollectButton({ tokenId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);
  const { mutateAsync: mint } = useContractWrite(contract, 'mint');

  const handleCollect = async () => {
    try {
      setIsLoading(true);
      await mint({
        args: [tokenId, 1],
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-bold mt-8"
      onClick={handleCollect}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
      ) : (
        <>
          <Plus className="w-5 h-5 mr-2" />
          Collect
        </>
      )}
    </Button>
  );
}
