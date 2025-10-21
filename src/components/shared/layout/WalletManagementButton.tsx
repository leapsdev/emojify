'use client';

import { useWalletManagement } from '@/hooks/useWalletManagement';
import { useState } from 'react';
import { HiOutlineWallet } from 'react-icons/hi2';

/**
 * ウォレット管理ボタンコンポーネント
 *
 * ウォレットの切り替えと新しいウォレットの追加を行うドロップダウンボタンを表示します。
 * - Web環境: ウォレット一覧と切り替え機能を提供
 * - Farcaster Mini App環境: 何も表示しない（ウォレット管理機能が無効）
 *
 * @example
 * // ヘッダーの右側に配置
 * <Header
 *   rightContent={<WalletManagementButton />}
 * />
 */
export const WalletManagementButton = () => {
  const {
    linkWallet,
    wallets,
    activeWalletAddress,
    setActiveWallet,
    isAvailable,
  } = useWalletManagement();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ウォレット管理機能が利用不可の場合は何も表示しない
  if (!isAvailable || !linkWallet) {
    return null;
  }

  // ウォレット切り替え処理
  const handleWalletSwitch = async (wallet: (typeof wallets)[0]) => {
    if (!setActiveWallet) return;

    try {
      await setActiveWallet(wallet);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch wallet:', error);
    }
  };

  // 新しいウォレット追加処理
  const handleAddWallet = () => {
    linkWallet();
    setIsDropdownOpen(false);
  };

  // ウォレットアドレスを短縮表示（0x1234...5678形式）
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label="ウォレット管理"
      >
        <HiOutlineWallet className="w-4 h-4" />
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="wallet menu"
        >
          <title>wallet menu</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 border-b">
              <div className="font-medium">select wallet</div>
            </div>

            {/* 接続済みウォレット一覧 */}
            {wallets.map((wallet) => {
              const walletAddress = wallet.address.toLowerCase();
              const isActive =
                activeWalletAddress?.toLowerCase() === walletAddress;

              return (
                <div
                  key={wallet.address}
                  className={`flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleWalletSwitch(wallet)}
                    className="flex-1 text-left font-mono text-xs"
                  >
                    {formatAddress(wallet.address)}
                  </button>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="current wallet"
                      >
                        <title>current wallet</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 新しいウォレットを追加 */}
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleAddWallet}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>+</span>
                  <span>add wallet</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
