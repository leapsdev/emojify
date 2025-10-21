'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { ConnectedWallet } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

interface WalletManagementState {
  linkWallet: (() => void) | null;
  unlinkWallet: ((address: string) => Promise<unknown>) | null;
  wallets: ReturnType<typeof useWallets>['wallets'];
  activeWalletAddress: string | undefined;
  setActiveWallet: ((wallet: ConnectedWallet) => Promise<void>) | null;
  isAvailable: boolean;
  walletCount: number;
}

/**
 * Privyのウォレット管理機能を提供するカスタムフック
 * - Web環境: Privyの`linkWallet`機能でウォレットを追加可能、`setActiveWallet`でウォレット切り替え可能、`unlinkWallet`でウォレット削除可能
 * - Farcaster Mini App環境: ウォレット管理機能は無効化
 *
 * @returns {WalletManagementState} ウォレット管理の状態と機能
 * - linkWallet: Privyのウォレット接続モーダルを開く関数（Mini Appでは無効）
 * - unlinkWallet: ウォレット削除関数（アドレスを引数に取る、Mini Appでは無効）
 * - wallets: 接続済みウォレットリスト
 * - activeWalletAddress: 現在アクティブなウォレットアドレス
 * - setActiveWallet: ウォレット切り替え関数（ConnectedWalletオブジェクトを受け取る）
 * - isAvailable: ウォレット管理機能が利用可能か（Privy環境のみtrue）
 * - walletCount: 接続済みウォレット数
 */
export function useWalletManagement(): WalletManagementState {
  const { isMiniApp } = useIsMiniApp();
  const { linkWallet, unlinkWallet } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const { setActiveWallet: privySetActiveWallet } = useSetActiveWallet();

  const state = useMemo((): WalletManagementState => {
    // Farcaster Mini App環境ではウォレット管理機能を無効化
    if (isMiniApp) {
      return {
        linkWallet: null,
        unlinkWallet: null,
        wallets: [],
        activeWalletAddress: undefined,
        setActiveWallet: null,
        isAvailable: false,
        walletCount: 0,
      };
    }

    // Web環境（Privy）ではウォレット管理機能を提供
    return {
      linkWallet,
      unlinkWallet,
      wallets,
      activeWalletAddress: address,
      setActiveWallet: privySetActiveWallet,
      isAvailable: true,
      walletCount: wallets.length,
    };
  }, [
    isMiniApp,
    linkWallet,
    unlinkWallet,
    wallets,
    address,
    privySetActiveWallet,
  ]);

  return state;
}
