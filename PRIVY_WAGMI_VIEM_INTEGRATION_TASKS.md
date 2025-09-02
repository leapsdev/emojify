# Privy + Wagmi + Viem 統合タスク

## プロジェクト概要

このプロジェクトは、Privy、Wagmi、Viemを使用したEmoji Chatアプリケーションです。現在、これらのライブラリが適切に統合されていない状態にあります。

## 現在の状況

### 使用されているライブラリ
- **Privy**: ウォレット管理と認証 (`@privy-io/react-auth`)
- **Wagmi**: 設定されているが使用されていない (`wagmi`, `@wagmi/core`)
- **Viem**: 直接使用してトランザクション実行 (`viem`)
- **OnchainKit**: Coinbaseのツールキット (`@coinbase/onchainkit`)

### 現在の問題点

1. **ファイル名の不整合**
   - `useThirdwebMint.ts` → 実際にはThirdwebを使用していない
   - 関数名 `useWagmiMint` → 実際にはWagmiを使用していない

2. **未使用のインポート**
   - `config` をインポートしているが使用していない
   - Wagmiのフックが使用されていない

3. **統合の不備**
   - Privyのウォレットから直接Viemを使用
   - Wagmiの設定が活用されていない
   - 標準的なパターンに従っていない

## 統合タスク

### Phase 1: ファイル整理とリネーム

#### 1.1 ファイル名の修正
```bash
# 現在のファイル
src/components/features/create-emoji/hooks/useThirdwebMint.ts

# 修正後
src/components/features/create-emoji/hooks/useEmojiMint.ts
```

#### 1.2 関数名の修正
```typescript
// 現在
export const useWagmiMint = () => {

// 修正後
export const useEmojiMint = () => {
```

### Phase 2: Wagmi統合の実装

#### 2.1 Wagmiフックの使用
```typescript
// src/components/features/create-emoji/hooks/useEmojiMint.ts
import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { useWalletClient, useAccount } from 'wagmi';

export const useEmojiMint = () => {
  const { data: walletClient } = useWalletClient({ config });
  const { address } = useAccount();

  const mintNFT = async (metadataUrl: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const transactionHash = await walletClient.writeContract({
        ...emojiContract,
        functionName: 'registerNewEmoji',
        args: [address, metadataUrl, '0x' as `0x${string}`],
      });

      return { transactionHash: transactionHash as string };
    } catch (error: unknown) {
      const e = error as { code?: number; message?: string };
      if (e.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      console.error('Transaction error:', error);
      throw new Error(e.message || 'Transaction failed with unknown error');
    }
  };

  return { mintNFT };
};
```

#### 2.2 CreateEmojiFormの更新
```typescript
// src/components/features/create-emoji/CreateEmojiForm.tsx
import { useEmojiMint } from './hooks/useEmojiMint';

export function CreateEmojiForm() {
  const { mintNFT } = useEmojiMint();
  
  const handleCreate = async () => {
    // ... existing code ...
    
    // Step 3: NFTのミント（Wagmiを使用）
    const { transactionHash } = await mintNFT(metadataUrl);
    
    // ... existing code ...
  };
}
```

### Phase 3: プロバイダー統合の最適化

#### 3.1 EthereumProvidersの統合確認
```typescript
// src/lib/basename/EthereumProviders.tsx
// 既存の実装は適切
export default function EthereumProviders({
  children,
}: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### 3.2 ルートレイアウトの更新
```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrivyProvider>
          <EthereumProviders>
            <OnchainProvider>
              <FarcasterMiniAppInitializer />
              {children}
              <Toaster />
            </OnchainProvider>
          </EthereumProviders>
        </PrivyProvider>
      </body>
    </html>
  );
}
```

### Phase 4: 他のコンポーネントの統合

#### 4.1 CollectButtonの更新
```typescript
// src/components/features/collect-emoji/components/CollectButton.tsx
import { config } from '@/lib/basename/wagmi';
import { useWalletClient, useAccount } from 'wagmi';
import { readContract, writeContract } from '@wagmi/core';

export function CollectButton({ tokenId }: Props) {
  const { data: walletClient } = useWalletClient({ config });
  const { address } = useAccount();

  const handleCollect = async () => {
    if (!walletClient || !address) {
      console.error('No wallet connected');
      return;
    }

    try {
      // ... existing logic ...
      
      const hash = await writeContract(config, {
        ...emojiContract,
        functionName: 'addEmojiSupply',
        args: [
          address as `0x${string}`,
          BigInt(tokenId),
          BigInt(1),
          '0x' as `0x${string}`,
        ],
        value: valueToSend,
      });

      // ... existing code ...
    } catch (error) {
      // ... error handling ...
    }
  };
}
```

### Phase 5: カスタムフックの整理

#### 5.1 ウォレット管理フックの統合
```typescript
// src/hooks/useWallet.ts
import { useAccount, useWalletClient } from 'wagmi';
import { config } from '@/lib/basename/wagmi';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ config });

  return {
    address,
    isConnected,
    walletClient,
  };
};
```

#### 5.2 接続状態フックの統合
```typescript
// src/hooks/useCollectWallet.ts
import { useAccount } from 'wagmi';

export const useCollectWallet = () => {
  const { address, isConnected, isLoading } = useAccount();

  return {
    isConnected,
    walletAddress: address,
    isLoading,
  };
};
```

## 実装順序

### 優先度: 高
1. **ファイル名と関数名の修正**
2. **useEmojiMintのWagmi統合**
3. **CreateEmojiFormの更新**

### 優先度: 中
4. **ルートレイアウトのプロバイダー統合**
5. **CollectButtonのWagmi統合**

### 優先度: 低
6. **カスタムフックの整理**
7. **エラーハンドリングの統一**
8. **型定義の改善**

## 期待される効果

### メリット
- **標準的なパターン**: Wagmiの業界標準に準拠
- **保守性の向上**: コードがより読みやすく、保守しやすい
- **拡張性**: 将来的な機能追加が容易
- **エラーハンドリング**: 統一されたエラーハンドリング
- **型安全性**: より良い型推論とエラー検出

### 注意点
- **段階的な移行**: 既存の機能を壊さないよう段階的に実装
- **テスト**: 各段階で十分なテストを実施
- **ロールバック**: 問題が発生した場合のロールバック計画

## 完了後の状態

統合完了後、以下のような構成になります：

```
Privy (認証・ウォレット管理)
  ↓
Wagmi (Ethereum接続・状態管理)
  ↓
Viem (トランザクション実行)
  ↓
OnchainKit (Coinbaseツール)
```

この構成により、各ライブラリの強みを活かしながら、標準的で保守しやすいコードベースを実現できます。
