# Farcaster Mini App 自動ログイン機能実装タスク

## 概要
Farcasterのminiappで開いた際に、Farcasterのアカウントで自動ログインする機能を実装する。

## 現在のプロジェクト状況

### 技術スタック
- **Next.js 15.2.1** - React フレームワーク
- **@farcaster/miniapp-sdk** - Farcaster Mini App SDK
- **@farcaster/miniapp-wagmi-connector** - Wagmi用Farcasterコネクター
- **@privy-io/react-auth** - 認証プロバイダー
- **Firebase** - バックエンド認証
- **Wagmi** - Ethereum接続管理

### 現在の認証フロー
1. **PrivyProvider** - メイン認証プロバイダー（wallet, farcaster, email対応）
2. **FirebaseAuthSync** - PrivyとFirebaseの認証同期
3. **FarcasterMiniAppInitializer** - Farcaster SDK初期化
4. **useFarcasterMiniApp** - Farcaster SDK状態管理

## 実装タスク

### 1. Farcaster Mini App コンテキスト検出機能の実装

#### 1.1 Farcaster環境検出フックの作成
**ファイル**: `src/hooks/useFarcasterEnvironment.ts`

```typescript
'use client';

import { useFarcasterMiniApp } from './useFarcasterMiniApp';
import { useEffect, useState } from 'react';

interface FarcasterEnvironment {
  isInFarcasterApp: boolean;
  userContext: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
  isLoading: boolean;
}

export function useFarcasterEnvironment(): FarcasterEnvironment {
  const { isReady, context, sdk } = useFarcasterMiniApp();
  const [environment, setEnvironment] = useState<FarcasterEnvironment>({
    isInFarcasterApp: false,
    userContext: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkFarcasterEnvironment = async () => {
      if (!isReady || !sdk) {
        setEnvironment(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Farcaster Mini App内かどうかを検出
        const isInFarcasterApp = typeof window !== 'undefined' && 
          (window.parent !== window || 
           navigator.userAgent.includes('Farcaster') ||
           document.referrer.includes('farcaster'));

        if (isInFarcasterApp && context) {
          const userContext = (context as any)?.user;
          setEnvironment({
            isInFarcasterApp: true,
            userContext: userContext || null,
            isLoading: false,
          });
        } else {
          setEnvironment({
            isInFarcasterApp: false,
            userContext: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Farcaster環境検出エラー:', error);
        setEnvironment({
          isInFarcasterApp: false,
          userContext: null,
          isLoading: false,
        });
      }
    };

    checkFarcasterEnvironment();
  }, [isReady, context, sdk]);

  return environment;
}
```

#### 1.2 Farcaster認証フックの作成
**ファイル**: `src/hooks/useFarcasterAuth.ts`

```typescript
'use client';

import { useFarcasterEnvironment } from './useFarcasterEnvironment';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface FarcasterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useFarcasterAuth() {
  const { isInFarcasterApp, userContext, isLoading } = useFarcasterEnvironment();
  const { authenticated: isPrivyAuthenticated, login } = usePrivy();
  const [authState, setAuthState] = useState<FarcasterAuthState>({
    isAuthenticating: false,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    const handleFarcasterAutoLogin = async () => {
      if (isLoading || !isInFarcasterApp || !userContext || isPrivyAuthenticated) {
        return;
      }

      setAuthState(prev => ({ ...prev, isAuthenticating: true, error: null }));

      try {
        // Farcasterで自動ログインを実行
        await login('farcaster');
        
        setAuthState({
          isAuthenticating: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error) {
        console.error('Farcaster自動ログインエラー:', error);
        setAuthState({
          isAuthenticating: false,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : '認証に失敗しました',
        });
      }
    };

    handleFarcasterAutoLogin();
  }, [isLoading, isInFarcasterApp, userContext, isPrivyAuthenticated, login]);

  return {
    ...authState,
    userContext,
    isInFarcasterApp,
  };
}
```

### 2. Privy設定の更新

#### 2.1 PrivyProvider設定の更新
**ファイル**: `src/components/providers/PrivyProvider.tsx`

```typescript
// 既存の設定に以下を追加
export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderClient
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['wallet', 'farcaster', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: false, // Farcasterを優先
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: true,
        },
        // Farcaster設定を追加
        farcaster: {
          enabled: true,
          autoConnect: true, // 自動接続を有効化
        },
      }}
    >
      <FirebaseAuthSync>{children}</FirebaseAuthSync>
    </PrivyProviderClient>
  );
}
```

### 3. 自動ログインコンポーネントの実装

#### 3.1 FarcasterAutoLoginコンポーネントの作成
**ファイル**: `src/components/features/auth/FarcasterAutoLogin.tsx`

```typescript
'use client';

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { Loading } from '@/components/ui/Loading';

interface FarcasterAutoLoginProps {
  children: React.ReactNode;
}

export function FarcasterAutoLogin({ children }: FarcasterAutoLoginProps) {
  const { 
    isAuthenticating, 
    isAuthenticated, 
    error, 
    userContext, 
    isInFarcasterApp 
  } = useFarcasterAuth();

  // Farcaster Mini App内でない場合は通常の子コンポーネントを表示
  if (!isInFarcasterApp) {
    return <>{children}</>;
  }

  // 認証中の場合
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">
            Farcasterアカウントでログイン中...
          </p>
        </div>
      </div>
    );
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ログインエラー
          </h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // 認証成功または通常の表示
  return <>{children}</>;
}
```

### 4. レイアウトの更新

#### 4.1 RootLayoutの更新
**ファイル**: `src/app/layout.tsx`

```typescript
// 既存のimportに追加
import { FarcasterAutoLogin } from '@/components/features/auth/FarcasterAutoLogin';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider>
          <EthereumProviders>
            <OnchainProvider>
              <FarcasterMiniAppInitializer />
              <FarcasterAutoLogin>
                {children}
              </FarcasterAutoLogin>
              <Toaster />
            </OnchainProvider>
          </EthereumProviders>
        </PrivyProvider>
      </body>
    </html>
  );
}
```

### 5. 環境変数の設定

#### 5.1 環境変数の追加
**ファイル**: `.env.local`

```bash
# 既存の環境変数に追加
NEXT_PUBLIC_FARCASTER_APP_ID=your_farcaster_app_id
NEXT_PUBLIC_FARCASTER_APP_SECRET=your_farcaster_app_secret
```

### 6. 型定義の追加

#### 6.1 Farcaster型定義の更新
**ファイル**: `src/types/farcaster.ts`

```typescript
// 既存の型定義に追加
export interface FarcasterMiniAppContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    bio?: string;
    location?: {
      placeId: string;
      description: string;
    };
  };
  client: {
    platformType?: 'web' | 'mobile';
    clientFid: number;
    added: boolean;
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  features?: {
    haptics: boolean;
    cameraAndMicrophoneAccess?: boolean;
  };
}

export interface FarcasterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  userContext: FarcasterMiniAppContext['user'] | null;
  isInFarcasterApp: boolean;
}
```

### 7. テストの実装

#### 7.1 Farcaster認証テストの作成
**ファイル**: `src/__tests__/hooks/useFarcasterAuth.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

// モックの実装
jest.mock('@/hooks/useFarcasterEnvironment');
jest.mock('@privy-io/react-auth');

describe('useFarcasterAuth', () => {
  it('should handle Farcaster environment detection', () => {
    // テストの実装
  });

  it('should trigger auto login when in Farcaster app', () => {
    // テストの実装
  });

  it('should handle authentication errors', () => {
    // テストの実装
  });
});
```

### 8. ドキュメントの更新

#### 8.1 READMEの更新
**ファイル**: `README.md`

```markdown
## Farcaster Mini App 自動ログイン機能

このアプリケーションはFarcaster Mini Appとして動作し、Farcasterクライアント内で開かれた際に自動的にFarcasterアカウントでログインします。

### 機能
- Farcaster Mini App環境の自動検出
- Farcasterアカウントでの自動ログイン
- ユーザーコンテキストの取得と表示
- エラーハンドリングと再試行機能

### 設定
環境変数に以下を設定してください：
- `NEXT_PUBLIC_FARCASTER_APP_ID`: FarcasterアプリID
- `NEXT_PUBLIC_FARCASTER_APP_SECRET`: Farcasterアプリシークレット
```

## 実装順序

1. **Phase 1**: 基本的なFarcaster環境検出機能
   - `useFarcasterEnvironment`フックの実装
   - 基本的な環境検出ロジック

2. **Phase 2**: 認証フローの実装
   - `useFarcasterAuth`フックの実装
   - Privyとの統合

3. **Phase 3**: UIコンポーネントの実装
   - `FarcasterAutoLogin`コンポーネントの実装
   - ローディング状態とエラーハンドリング

4. **Phase 4**: 統合とテスト
   - レイアウトへの統合
   - テストの実装
   - ドキュメントの更新

## 注意事項

1. **セキュリティ**: Farcasterの認証トークンは適切に検証する
2. **エラーハンドリング**: ネットワークエラーや認証失敗時の適切な処理
3. **ユーザビリティ**: ローディング状態とエラーメッセージの分かりやすい表示
4. **パフォーマンス**: 不要な再レンダリングを避ける
5. **テスト**: 各種シナリオでのテスト実装

## 参考資料

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Privy React Auth Documentation](https://docs.privy.io/guide/react/overview)
- [Wagmi Connectors Documentation](https://wagmi.sh/core/api/connectors)
