'use client';

import { LinkButton } from '@/components/ui/LinkButton';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { HiOutlineChevronLeft } from 'react-icons/hi2';
import { useAccount, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { usePrivy } from '@privy-io/react-auth';

/**
 * 共通ヘッダーコンポーネント
 *
 * @example
 * // 戻るボタンと中央タイトル
 * <Header
 *   backHref="/chat"
 *   centerContent={<h1 className="text-xl font-semibold">Title</h1>}
 * />
 *
 * // 中央アイコンのみ
 * <Header
 *   centerContent={<span className="text-2xl">💬</span>}
 * />
 *
 * // 戻るボタンと右側のメニュー
 * <Header
 *   backHref="/chat"
 *   rightContent={<MenuButton />}
 * />
 *
 * // useRouterを使用した戻るボタン
 * <Header
 *   onBack={() => router.push('/chat')}
 *   centerContent={<span>Title</span>}
 * />
 */
type HeaderProps = {
  /** 左側に表示するコンテンツ。指定がない場合、backHrefまたはonBackが指定されていれば戻るボタンが表示されます */
  leftContent?: React.ReactNode;
  /** 中央に表示するコンテンツ */
  centerContent?: React.ReactNode;
  /** 右側に表示するコンテンツ */
  rightContent?: React.ReactNode;
  /** 戻るボタンのリンク先。next/linkを使用したナビゲーション */
  backHref?: string;
  /** 戻るボタンのクリックハンドラ。useRouterを使用したナビゲーション */
  onBack?: () => void;
  /** 追加のスタイルクラス */
  className?: string;
};

export const Header = ({
  leftContent,
  centerContent,
  rightContent,
  backHref,
  onBack,
  className,
}: HeaderProps) => {
  const backButton =
    (backHref || onBack) &&
    (onBack ? (
      <button type="button" onClick={onBack} className="text-2xl">
        <HiOutlineChevronLeft />
      </button>
    ) : (
      <LinkButton
        href={backHref || ''}
        content={<HiOutlineChevronLeft />}
        className="text-2xl"
      />
    ));

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white',
        'flex items-center h-14 p-4 border-b',
        className,
      )}
    >
      {/* 左エリア - 絶対位置で配置 */}
      <div className="absolute left-4 h-full flex items-center">
        {leftContent || backButton}
      </div>

      {/* 中央エリア - flex-1で拡大、中央揃え */}
      <div className="flex-1 flex justify-center items-center h-full">
        {centerContent}
      </div>

      {/* 右エリア - 絶対位置で配置 */}
      <div className="absolute right-4 h-full flex items-center space-x-2">
        <ChainSwitchButton />
        {rightContent}
      </div>
    </div>
  );
};

/**
 * チェーン切替ボタンコンポーネント（ウォレットの状態を反映）
 */
const ChainSwitchButton = () => {
  const { user } = usePrivy();
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Privyの接続状態も考慮
  const isPrivyConnected = !!user?.wallet?.address;
  const actualIsConnected = isConnected || isPrivyConnected;
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
  const defaultChain = isProd ? base : baseSepolia;
  const availableChains = isProd
    ? [{ id: base.id, name: 'Base', symbol: 'ETH' }]
    : [{ id: baseSepolia.id, name: 'Base Sepolia', symbol: 'ETH' }];

  // チェーン情報が取得できない場合はデフォルトチェーンを使用
  const currentChain = chain 
    ? availableChains.find((c) => c.id === chain.id)
    : availableChains.find((c) => c.id === defaultChain.id) || availableChains[0];

  const currentChainName = currentChain?.name || 'Unknown';

  // 自動チェーン切り替え機能
  useEffect(() => {
    const autoSwitchChain = async () => {
      // ウォレットが接続されていない場合は何もしない
      if (!actualIsConnected) return;

      // チェーン情報が取得できない場合は、デフォルトチェーンに切り替え
      if (!chain) {
        try {
          await switchChain({ chainId: defaultChain.id });
        } catch (error) {
          console.error('デフォルトチェーン切り替えに失敗しました:', error);
        }
        return;
      }

      // 現在のチェーンが環境に適したチェーンでない場合、自動切り替え
      const targetChain = isProd ? base : baseSepolia;
      if (chain.id !== targetChain.id) {
        try {
          await switchChain({ chainId: targetChain.id });
        } catch (error) {
          console.error('自動チェーン切り替えに失敗しました:', error);
        }
      }
    };

    autoSwitchChain();
  }, [actualIsConnected, chain, isProd, switchChain, defaultChain]);

  // チェーン切替処理
  const handleChainSwitch = async (chainId: 8453 | 84532) => {
    try {
      await switchChain({ chainId });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('チェーン切替に失敗しました:', error);
    }
  };

  // ウォレットが接続されていない場合は何も表示しない
  if (!actualIsConnected) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span>{currentChainName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="チェーンメニューを開く"
        >
          <title>チェーンメニューを開く</title>
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
              <div className="font-medium">チェーンを選択</div>
            </div>

            {availableChains.map((chain) => (
              <button
                key={chain.id}
                type="button"
                onClick={() => handleChainSwitch(chain.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  chain.id === currentChain?.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{chain.name}</span>
                  {chain.id === currentChain?.id && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="現在選択中のチェーン"
                    >
                      <title>現在選択中のチェーン</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
