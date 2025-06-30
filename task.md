# ウォレット未接続時の中央表示ボタン作成タスク

## 実装タスク

### Phase 1: 基盤コンポーネントの作成

#### タスク 1.1: コレクトウォレットフックの作成
- **ファイル**: `src/hooks/useCollectWallet.ts`

```typescript
import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export const useCollectWallet = () => {
  const { wallets } = useWallets();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length > 0) {
      setIsConnected(true);
      setWalletAddress(wallets[0].address);
    } else {
      setIsConnected(false);
      setWalletAddress(null);
    }
  }, [wallets]);

  return {
    isConnected,
    walletAddress,
    isLoading: false,
  };
};
```

#### タスク 1.2: ウォレット接続ボタンコンポーネントの作成
- **ファイル**: `src/components/shared/WalletConnectButton.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/Button';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';

interface WalletConnectButtonProps {
  className?: string;
  showIcon?: boolean;
}

export const WalletConnectButton = ({ 
  className = "",
  showIcon = true
}: WalletConnectButtonProps) => {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  if (authenticated) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-8 ${className}`}>
      <Button
        disabled={!ready}
        onClick={login}
        className="bg-black text-white rounded-full px-8 py-4 text-lg font-bold hover:bg-gray-900 transition-colors"
      >
        {showIcon && <LogIn className="mr-2 h-5 w-5" />}
        ウォレットを接続
      </Button>
    </div>
  );
};
```

### Phase 2: 既存コンポーネントの更新

#### タスク 2.1: CreateEmojiFormの更新
- **ファイル**: `src/components/features/create-emoji/CreateEmojiForm.tsx`

```typescript
export function CreateEmojiForm() {
  const { isConnected } = useCollectWallet();

  if (!isConnected) {
    return <WalletConnectButton />;
  }

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      {/* 既存のフォームコンテンツ */}
    </div>
  );
}
```

#### タスク 2.2: CollectButtonの更新
- **ファイル**: `src/components/features/collect-emoji/components/CollectButton.tsx`

```typescript
export function CollectButton({ tokenId }: Props) {
  const { isConnected } = useCollectWallet();

  if (!isConnected) {
    return <WalletConnectButton />;
  }

  // 既存のコレクトロジック
  return (
    // ...
  );
}
```

#### タスク 2.3: ProfilePageの更新
- **ファイル**: `src/components/pages/ProfilePage.tsx`

```typescript
function ProfilePageContent({
  user,
  isOwnProfile = true,
  currentUserId,
  initialIsFriend = false,
}: ProfilePageProps) {
  const { selectedWalletAddress, noWalletWarning } = useWallet();
  const { nfts, error } = useGlobalNFTs();
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);

  // ... 既存のuseEffect

  if (noWalletWarning) {
    return <WalletConnectButton />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Header backHref={backHref} rightContent={rightContent} />
      <main className="flex flex-col font-nunito overflow-hidden max-w-full">
        {/* 既存のコンテンツ */}
      </main>
      <FooterNavigation />
    </>
  );
}
```

### Phase 3: 不要なコンポーネントの削除

#### タスク 3.1: NoWalletWarningコンポーネントの削除
- **ファイル**: `src/components/features/create-emoji/components/NoWalletWarning.tsx`

#### タスク 3.2: useWalletフックの整理
- **ファイル**: `src/components/features/create-emoji/hooks/useWallet.ts`

## 実装順序

### 高優先度
1. useCollectWalletフックの作成
2. WalletConnectButtonコンポーネントの作成

### 中優先度
1. CreateEmojiFormの更新
2. CollectButtonの更新
3. ProfilePageの更新
4. NoWalletWarningの削除

## 完了条件

- [ ] ウォレット未接続時に画面中央にボタンが表示される
- [ ] 接続後は自動的にボタンが消える
- [ ] 既存機能が正常に動作する
- [ ] モバイル対応が完了している 