import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { config } from '@/lib/basename/wagmi';
import { getFarcasterSDK } from '@/lib/farcaster';
import { useCallback, useEffect, useState } from 'react';
import type { WalletClient } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

interface UnifiedWalletReturn {
  address: string | undefined;
  isConnected: boolean;
  walletClient: WalletClient | unknown | null; // 環境によって異なる型（Farcaster SDKのプロバイダーはunknown）
  isLoading: boolean;
  error: string | null;
}

/**
 * 環境に応じて適切なウォレットを使用する統合ウォレットフック
 * - Mini App環境: Farcaster SDKのウォレット機能を使用
 * - Web環境: Privy + Wagmiウォレットを使用
 */
export const useUnifiedWallet = (): UnifiedWalletReturn => {
  const { isMiniApp } = useIsMiniApp();
  const { isAuthenticated } = useUnifiedAuth();

  // Wagmi (Privy) ウォレット情報
  const { address: wagmiAddress } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient({ config });

  // Farcaster ウォレット状態
  const [farcasterWallet, setFarcasterWallet] = useState<{
    address: string | undefined;
    walletClient: unknown | null; // Farcaster環境のプロバイダー
    isLoading: boolean;
    error: string | null;
  }>({
    address: undefined,
    walletClient: null,
    isLoading: false,
    error: null,
  });

  // Farcaster ウォレットの初期化と情報取得
  const initializeFarcasterWallet = useCallback(async () => {
    if (!isMiniApp || !isAuthenticated) {
      return;
    }

    setFarcasterWallet((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const sdk = getFarcasterSDK();
      if (!sdk) {
        throw new Error('Farcaster SDK is not available');
      }

      // Ethereum Provider を取得
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Ethereum provider is not available');
      }

      // ウォレットアドレスを取得
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[];

      const address = accounts?.[0];

      console.log('Farcaster wallet initialized:', { address, provider });

      setFarcasterWallet({
        address,
        walletClient: provider,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Farcaster wallet initialization error:', error);
      setFarcasterWallet({
        address: undefined,
        walletClient: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [isMiniApp, isAuthenticated]);

  // Mini App環境でのウォレット初期化
  useEffect(() => {
    if (isMiniApp && isAuthenticated) {
      initializeFarcasterWallet();
    }
  }, [isMiniApp, isAuthenticated, initializeFarcasterWallet]);

  // 環境に応じて適切なウォレット情報を返す
  if (isMiniApp) {
    console.log('Using Farcaster wallet:', {
      address: farcasterWallet.address,
      isConnected: isAuthenticated && !!farcasterWallet.address,
      isLoading: farcasterWallet.isLoading,
      error: farcasterWallet.error,
    });

    return {
      address: farcasterWallet.address,
      isConnected: isAuthenticated && !!farcasterWallet.address,
      walletClient: farcasterWallet.walletClient,
      isLoading: farcasterWallet.isLoading,
      error: farcasterWallet.error,
    };
  }

  // Web環境 (Privy + Wagmi)
  console.log('Using Privy wallet:', {
    address: wagmiAddress,
    isConnected: isAuthenticated && !!wagmiAddress,
  });

  return {
    address: wagmiAddress,
    isConnected: isAuthenticated && !!wagmiAddress,
    walletClient: wagmiWalletClient || null,
    isLoading: false,
    error: null,
  };
};
