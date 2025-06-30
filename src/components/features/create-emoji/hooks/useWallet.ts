import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export const useWallet = () => {
  const { wallets } = useWallets();
  const [selectedWalletAddress, setSelectedWalletAddress] =
    useState<string>('');

  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletAddress(wallets[0].address);
    } else {
      setSelectedWalletAddress('');
    }
  }, [wallets]);

  const getSelectedWallet = () => {
    return wallets.find((wallet) => wallet.address === selectedWalletAddress);
  };

  return {
    selectedWalletAddress,
    getSelectedWallet,
    wallets,
  };
};
