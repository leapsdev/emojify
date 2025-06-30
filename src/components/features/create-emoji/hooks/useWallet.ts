import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export const useWallet = () => {
  const { wallets } = useWallets();
  const [selectedWalletAddress, setSelectedWalletAddress] =
    useState<string>('');
  const [noWalletWarning, setNoWalletWarning] = useState(false);

  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletAddress(wallets[0].address);
      setNoWalletWarning(false);
    } else {
      setSelectedWalletAddress('');
      setNoWalletWarning(true);
    }
  }, [wallets]);

  const getSelectedWallet = () => {
    return wallets.find((wallet) => wallet.address === selectedWalletAddress);
  };

  return {
    selectedWalletAddress,
    noWalletWarning,
    getSelectedWallet,
    wallets,
  };
};
