import { useIsMiniApp } from '@/components/providers/AuthProvider';

import { config } from '@/lib/basename/wagmi';
import { getFarcasterSDK } from '@/lib/farcaster';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // 前回のウォレットアドレスを追跡（無限ループを防ぐため）
  const previousAddressRef = useRef<string | undefined>(undefined);

  // Farcaster ウォレットの初期化と情報取得
  const initializeFarcasterWallet = useCallback(async () => {
    if (!isMiniApp) {
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

      // Farcaster SDKの公式ドキュメントに基づいてウォレットアドレスを取得
      let accounts: string[];

      try {
        // Farcaster SDKでは eth_requestAccounts を使用してウォレット接続を要求
        accounts = (await provider.request({
          method: 'eth_requestAccounts',
        })) as string[];
      } catch {
        // eth_requestAccounts が失敗した場合、eth_accounts を試行
        try {
          accounts = (await provider.request({
            method: 'eth_accounts',
          })) as string[];
        } catch {
          accounts = [];
        }
      }

      let address = accounts?.[0];
      console.log('Extracted address from provider:', address);

      // プロバイダーからアドレスが取得できない場合、SDKのコンテキストから取得を試行
      if (!address) {
        console.log(
          'No address from provider, trying to get from SDK context...',
        );
        try {
          const context = await sdk.context;
          console.log('SDK context:', context);

          // コンテキストからユーザー情報を取得
          if (context && typeof context === 'object' && 'user' in context) {
            const user = (context as { user: unknown }).user;
            console.log('User from context:', user);

            // ユーザー情報からウォレットアドレスを取得
            if (user && typeof user === 'object' && user !== null) {
              // 様々な可能性のあるプロパティ名をチェック
              const possibleAddressFields = [
                'address',
                'walletAddress',
                'ethAddress',
                'wallet_address',
              ];
              for (const field of possibleAddressFields) {
                if ((user as Record<string, unknown>)[field]) {
                  address = (user as Record<string, unknown>)[field] as string;
                  console.log(`Found address in user.${field}:`, address);
                  break;
                }
              }
            }
          }
        } catch (contextError) {
          console.log('Failed to get address from SDK context:', contextError);
        }
      }

      // まだアドレスが取得できない場合、プロバイダーの状態を確認
      if (!address) {
        console.log('Still no address found, checking provider state...');
        try {
          // プロバイダーの状態を確認
          const chainId = await provider.request({ method: 'eth_chainId' });
          console.log('Chain ID:', chainId);

          // ネットワークIDも確認
          const netVersion = await provider.request({ method: 'net_version' });
          console.log('Network version:', netVersion);
        } catch (stateError) {
          console.log('Failed to get provider state:', stateError);
        }
      }

      console.log('Final extracted address:', address);
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
  }, [isMiniApp]);

  // Mini App環境でのウォレット初期化とアカウント変更監視
  useEffect(() => {
    if (!isMiniApp) {
      return;
    }

    initializeFarcasterWallet();

    // accountsChanged イベントのリスナーを設定
    const setupAccountsListener = async () => {
      try {
        const sdk = getFarcasterSDK();
        if (!sdk) {
          console.log('SDK not available for accounts listener');
          return;
        }

        const provider = await sdk.wallet.getEthereumProvider();
        if (!provider || typeof provider.on !== 'function') {
          console.log('Provider does not support event listeners');
          return;
        }

        const handleAccountsChanged = (accounts: readonly `0x${string}`[]) => {
          const newAddress = accounts?.[0];
          console.log('🔄 accountsChanged event detected:', {
            newAddress,
            previousAddress: previousAddressRef.current,
          });

          // アドレスが実際に変更された場合のみ再初期化
          if (newAddress && newAddress !== previousAddressRef.current) {
            console.log('Wallet address changed, reinitializing...');
            previousAddressRef.current = newAddress;
            initializeFarcasterWallet();
          }
        };

        provider.on('accountsChanged', handleAccountsChanged);

        return () => {
          if (typeof provider.removeListener === 'function') {
            provider.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      } catch (error) {
        console.error('Failed to setup accounts listener:', error);
      }
    };

    const cleanup = setupAccountsListener();

    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [isMiniApp, initializeFarcasterWallet]);

  // 環境に応じて適切なウォレット情報を返す
  if (isMiniApp) {
    console.log('Using Farcaster wallet:', {
      address: farcasterWallet.address,
      isConnected: !!farcasterWallet.address,
      isLoading: farcasterWallet.isLoading,
      error: farcasterWallet.error,
    });

    return {
      address: farcasterWallet.address,
      isConnected: !!farcasterWallet.address,
      walletClient: farcasterWallet.walletClient,
      isLoading: farcasterWallet.isLoading,
      error: farcasterWallet.error,
    };
  }

  // Web環境 (Privy + Wagmi)
  console.log('Using Privy wallet:', {
    address: wagmiAddress,
    isConnected: !!wagmiAddress,
  });

  return {
    address: wagmiAddress,
    isConnected: !!wagmiAddress,
    walletClient: wagmiWalletClient || null,
    isLoading: false,
    error: null,
  };
};
