# Farcaster Mini App 認証システム分析レポート

## プロジェクト概要

**プロジェクト名**: emoji-chat  
**技術スタック**: Next.js 15, React 19, TypeScript, Firebase, Privy, Farcaster Mini App SDK  
**パッケージ管理**: pnpm

## 現在の認証システム構成

### 1. 認証フロー
```
Farcaster Mini App → Privy認証 → Firebase認証 → アプリケーション
```

### 2. 主要コンポーネント

#### 2.1 Privy認証
- **ファイル**: `src/components/providers/PrivyProvider.tsx`
- **設定**: ウォレット、Farcaster、メール認証をサポート
- **役割**: プライマリ認証プロバイダー

#### 2.2 Firebase認証
- **ファイル**: `src/hooks/useFirebaseAuth.ts`, `src/lib/firebase-auth.ts`
- **役割**: PrivyトークンをFirebaseカスタムトークンに変換
- **API**: `/api/auth/firebase-token` エンドポイント

#### 2.3 Farcaster Mini App SDK
- **ファイル**: `src/lib/farcaster.ts`, `src/hooks/useFarcasterMiniApp.ts`
- **役割**: Farcasterコンテキストの取得とMini App判定

## 課題分析

### 1. Privy認証への依存
現在のシステムは以下の理由でPrivy認証に強く依存している：

- **認証フロー**: すべての認証がPrivy経由で実行される
- **ユーザーID**: PrivyのユーザーIDをFirebaseのUIDとして使用
- **トークン管理**: PrivyのアクセストークンがFirebase認証の前提条件

### 2. Firebase認証の制約
- **カスタムトークン生成**: PrivyのユーザーIDが必要
- **認証状態管理**: Privyの認証状態に依存

### 3. Farcaster Mini App特有の課題
- **認証方法の制限**: Mini App内では標準的なWeb認証フローが制限される
- **コンテキスト取得**: Farcaster SDKからユーザー情報を直接取得する必要

## 解決策提案

### 1. Farcaster Quick Auth + Firebase認証システムの実装

#### 1.1 Farcaster Quick Auth認証フックの作成
```typescript
// src/hooks/useFarcasterAuth.ts
import { sdk } from '@farcaster/frame-sdk';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFarcasterAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticateWithFarcaster = async () => {
      try {
        // Farcaster Quick Authトークンを取得
        const { token } = await sdk.quickAuth.getToken();
        
        // サーバーサイドでFirebaseカスタムトークンを取得
        const response = await fetch('/api/auth/farcaster-firebase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { customToken } = await response.json();
          
          // Firebaseにカスタムトークンでサインイン
          await signInWithCustomToken(auth, customToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Farcaster認証エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    authenticateWithFarcaster();
  }, []);

  return { isAuthenticated, user, isLoading };
}
```

#### 1.2 Farcaster認証プロバイダーの実装
```typescript
// src/components/providers/FarcasterAuthProvider.tsx
export function FarcasterAuthProvider({ children }) {
  const { isAuthenticated, user, isLoading } = useFarcasterAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <div>Farcaster認証が必要です</div>;
  }

  return <>{children}</>;
}
```

#### 1.3 Farcaster用FirebaseカスタムトークンAPI
```typescript
// src/app/api/auth/farcaster-firebase-token/route.ts
import { createClient } from '@farcaster/quick-auth';
import { createFirebaseCustomToken } from '@/lib/firebase-auth';

const client = createClient();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Farcaster JWTを検証
    const payload = await client.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
    });

    // FIDをユーザーIDとして使用
    const farcasterUserId = `farcaster_${payload.sub}`;
    
    // Firebaseカスタムトークンを生成
    const customToken = await createFirebaseCustomToken(farcasterUserId, {
      farcasterFid: payload.sub,
      authProvider: 'farcaster',
    });

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('Farcaster Firebase token API error:', error);
    return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
  }
}
```

### 2. 認証フローの分離

#### 2.1 条件分岐による認証方法の選択
```typescript
// src/components/providers/AuthProvider.tsx
export function AuthProvider({ children }) {
  const { isMiniApp } = useFarcasterMiniApp();

  if (isMiniApp) {
    // Farcaster Mini App環境ではFarcaster認証を使用
    return (
      <FarcasterAuthProvider>
        {children}
      </FarcasterAuthProvider>
    );
  } else {
    // 通常のWeb環境では既存のPrivy + Firebase認証を使用
    return (
      <PrivyProvider>
        {children}
      </PrivyProvider>
    );
  }
}
```

#### 2.2 ユーザーID管理の統一
```typescript
// Farcaster認証ではFIDをプレフィックス付きで使用
const farcasterUserId = `farcaster_${farcasterContext.user.fid}`;

// Privy認証では既存のPrivy IDを使用
const privyUserId = privyUser.id;
```

### 3. Firebase認証の拡張

#### 3.1 Firebaseカスタムトークンの拡張
```typescript
// src/lib/firebase-auth.ts
export async function createFirebaseCustomToken(
  userId: string,
  customClaims?: {
    farcasterFid?: number;
    privyId?: string;
    authProvider: 'privy' | 'farcaster';
  }
): Promise<string> {
  try {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await getAuth().createCustomToken(userId, customClaims || {});
    return customToken;
  } catch (error) {
    console.error('Firebaseカスタムトークン生成エラー:', error);
    throw new Error('Firebase認証トークンの生成に失敗しました');
  }
}
```

#### 3.2 認証プロバイダー別のFirebase認証
```typescript
// src/lib/auth.ts の拡張
export async function getFirebaseCustomTokenFromFarcaster(
  farcasterToken: string,
): Promise<string | null> {
  try {
    if (!farcasterToken) {
      return null;
    }

    // Farcaster JWTを検証
    const client = createClient();
    const payload = await client.verifyJwt({
      token: farcasterToken,
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
    });

    // FIDをユーザーIDとして使用
    const farcasterUserId = `farcaster_${payload.sub}`;
    
    // Firebaseカスタムトークンを生成
    const customToken = await createFirebaseCustomToken(farcasterUserId, {
      farcasterFid: payload.sub,
      authProvider: 'farcaster',
    });
    
    return customToken;
  } catch (error) {
    console.error('Farcaster Firebase custom token generation error:', error);
    return null;
  }
}
```

## 実装計画

### Phase 1: Farcaster認証基盤の構築
1. **@farcaster/quick-auth** パッケージのインストール
2. Farcaster認証フック (`useFarcasterAuth`) の実装
3. Farcaster認証プロバイダーの作成
4. Farcaster用FirebaseカスタムトークンAPIの実装

### Phase 2: 認証フローの分離
1. 環境検出ロジックの実装（Mini App判定）
2. 条件分岐による認証方法の選択
3. 既存Privy認証システムとの互換性確保
4. 認証プロバイダーの統一インターフェース作成

### Phase 3: Firebase認証の拡張
1. Firebaseカスタムトークンの拡張（カスタムクレーム対応）
2. 認証プロバイダー別のFirebase認証関数の実装
3. 既存のFirebase認証システムとの統合

### Phase 4: テストと最適化
1. Farcaster Mini App環境でのテスト
2. 既存機能の動作確認
3. パフォーマンス最適化
4. エラーハンドリングの強化

## 技術的考慮事項

### 1. セキュリティ
- Farcaster JWTの適切な検証
- トークンの有効期限管理
- 認証状態の整合性確保
- ドメイン検証の実装

### 2. パフォーマンス
- 認証フローの最適化
- 不要なAPI呼び出しの削減
- トークンキャッシュの実装

### 3. 保守性
- 認証ロジックの分離
- 共通インターフェースの定義
- エラーハンドリングの統一
- 認証プロバイダーの抽象化

## 結論

Farcaster Mini Appからのアクセス時にPrivy認証を使用せず、**Farcaster Quick Auth + Firebase認証**を実装することは技術的に可能です。この実装により、以下の利点が得られます：

### 利点
1. **Farcasterネイティブ認証**: Mini App環境に最適化された認証フロー
2. **Firebase認証の継続**: 既存のFirebase認証システムを維持
3. **セキュリティの向上**: Farcaster JWTによる安全な認証
4. **ユーザー体験の向上**: Mini App内での自然な認証体験

### 実装時の注意点
1. **段階的な実装**: 既存システムを破壊しないよう段階的に実装
2. **互換性の維持**: 既存のPrivy認証ユーザーへの影響を最小化
3. **テストの徹底**: Farcaster Mini App環境での十分なテスト
4. **パッケージ管理**: `@farcaster/quick-auth`の適切な設定
5. **環境変数の設定**: ドメイン検証用の環境変数設定

### 必要な依存関係
```bash
pnpm add @farcaster/quick-auth
```

この実装により、Farcaster Mini Appユーザーはより自然な認証体験を得られ、アプリケーションのユーザビリティが大幅に向上することが期待されます。また、既存のPrivy認証ユーザーへの影響を最小限に抑えながら、新しい認証方法を導入できます。

## 参考ドキュメント

### Farcaster Mini Apps公式ドキュメント
- **URL**: https://miniapps.farcaster.xyz/docs/specification
- **内容**: Farcaster Mini Appsの仕様とSDKの使用方法
- **主要な情報**:
  - Farcaster Quick Auth JWTの検証方法
  - `sdk.quickAuth.getToken()` と `sdk.quickAuth.fetch()` の使用方法
  - JWTペイロードの構造と検証手順
  - ユーザーコンテキストの取得方法

### Farcaster Quick Auth
- **パッケージ**: `@farcaster/quick-auth`
- **インストール**: `npm install @farcaster/quick-auth`
- **主要機能**:
  - JWT検証: `client.verifyJwt()`
  - クライアント作成: `createClient()`
  - エラーハンドリング: `Errors.InvalidTokenError`

### 実装例の参考
- **Honoフレームワークでの実装例**: JWT検証とユーザー情報の解決
- **Reactでの実装例**: `sdk.quickAuth.fetch()` を使用した認証リクエスト
- **JavaScriptでの実装例**: 直接的なトークン取得とAPI呼び出し

### 技術仕様
- **JWTペイロード構造**:
  ```typescript
  {
    iat: number;    // 発行時刻
    iss: string;    // 発行者
    exp: number;    // 有効期限
    sub: number;    // ユーザーのFID
    aud: string;    // 対象ドメイン
  }
  ```
- **ユーザーコンテキスト**:
  ```typescript
  {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    location?: AccountLocation;
  }
  ```

### セキュリティ考慮事項
- ドメイン検証の必要性
- JWT有効期限の管理
- トークンの適切な検証手順
- エラーハンドリングの実装
