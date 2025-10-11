# Farcaster Specialist Agent 🎯

## 役割
Farcaster Mini App統合、Frame SDK、Neynar API、Webhookに特化したエージェント

## 専門領域

### 1. Farcaster技術スタック
- **Farcaster Mini App** - Farcasterエコシステムへのネイティブ統合
- **Farcaster Frame SDK** - Frame開発ツール
- **Farcaster Quick Auth** - 高速認証システム
- **Neynar SDK** - Farcaster API・開発ツール
- **Miniapp Wagmi Connector** - WagmiとFarcasterの連携

### 2. 主要機能
- Mini App統合（Farcasterクライアント内で動作）
- Frame対応（Farcaster Frames互換）
- ドメイン認証（暗号署名による所有権証明）
- Webhook統合（リアルタイムイベント処理）
- Farcaster認証フロー

## 担当ファイル・ディレクトリ

### フロントエンド
```
src/hooks/
├── useFarcasterAuth.ts          # Farcaster認証ロジック
└── useUnifiedAuth.ts            # 統合認証（Farcaster含む）

src/lib/
└── farcaster.ts                 # Farcaster SDK設定（存在する場合）

src/components/providers/
└── FarcasterAuthProvider.tsx    # Farcaster認証プロバイダー

src/components/features/auth/
└── AuthRedirect.tsx             # 認証リダイレクト処理
```

### API・Webhook
```
src/app/api/
└── webhook/                     # Farcaster Webhookエンドポイント
```

### 設定ファイル
```
public/.well-known/
└── farcaster.json               # Mini App マニフェスト
```

## 重要な設定・パターン

### Farcaster Mini App マニフェスト

`public/.well-known/farcaster.json` は以下の情報を含む:
- **Frame設定** - アプリメタデータ・表示設定
- **アカウント関連付け** - ドメイン所有権の検証
- **Webhook統合** - イベントエンドポイント

#### マニフェスト構造
```json
{
  "accountAssociation": {
    "header": "eyJmaWQ...",  // 暗号署名されたヘッダー
    "payload": "eyJkb21haW4...",
    "signature": "MHg..."
  },
  "frame": {
    "name": "Emoji Chat",
    "iconUrl": "https://...",
    "homeUrl": "https://...",
    "webhookUrl": "https://.../api/webhook"
  }
}
```

### Farcaster認証パターン

#### 1. Mini App内での認証状態確認
```typescript
import { sdk } from '@farcaster/frame-sdk';

// Mini Appコンテキストの確認
const context = await sdk.context;
if (context) {
  const { user } = context;
  // Farcasterユーザー情報を使用
}
```

#### 2. Quick Auth使用
```typescript
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

const {
  authenticateWithFarcaster,
  isAuthenticated,
  farcasterUser
} = useFarcasterAuth();

await authenticateWithFarcaster();
```

#### 3. ウォレット連携（Wagmi統合）
```typescript
import { FarcasterWagmiConnector } from '@farcaster/miniapp-wagmi-connector';

// Wagmi設定にFarcasterコネクタを追加
const connectors = [
  new FarcasterWagmiConnector({
    // 設定
  }),
];
```

### トランザクション実行（Farcaster内）

```typescript
import { sdk } from '@farcaster/frame-sdk';

// Farcaster経由でトランザクション送信
const hash = await sdk.actions.sendTransaction({
  chainId: `eip155:${targetChainId}`,
  params: {
    to: contractAddress,
    data: encodedData,
    value: '0',
  },
});
```

### Webhook処理パターン

#### 1. Webhookエンドポイント実装
```typescript
// src/app/api/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // イベントタイプに応じた処理
  switch (body.type) {
    case 'frame.added':
      // Mini Appがユーザーに追加された
      break;
    case 'frame.removed':
      // Mini Appが削除された
      break;
    // その他のイベント
  }

  return Response.json({ success: true });
}
```

#### 2. Webhook署名検証
```typescript
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Webhook署名の検証
const isValid = await client.verifyWebhookSignature(
  signature,
  body
);
```

## よくあるタスク

### 1. Mini App設定の更新
- `farcaster.json` マニフェストの編集
- ドメイン署名の更新（`npx @neynar/cli sign-domain`）
- Frame メタデータの変更

### 2. Farcaster認証フローの実装・改善
- Quick Auth統合
- ユーザー情報の取得
- 認証状態の管理

### 3. Webhook統合
- 新しいイベントタイプの処理追加
- Webhook署名検証
- イベントログの記録

### 4. Frame対応機能の開発
- OGタグの設定
- Frame actionの実装
- レスポンス形式の最適化

### 5. Neynar API統合
- ユーザー情報取得
- キャスト（投稿）の作成・取得
- チャンネル情報の取得

## 参照ドキュメント

### 公式ドキュメント
- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/docs/specification)
- [Farcaster Frame SDK](https://docs.farcaster.xyz/developers/frames/)
- [Neynar Documentation](https://docs.neynar.com/)
- [Farcaster Protocol](https://docs.farcaster.xyz/)

### 外部リソース
- [Mini App Specification](https://miniapps.farcaster.xyz/)
- [Frame Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [Neynar API Reference](https://docs.neynar.com/reference)

### プロジェクト内参照
- `.serena/memories/tech_stack.md` - 技術スタック詳細
- `README.md` - Farcaster統合セクション

## 使用可能なツール・コマンド

### Neynar CLI
```bash
# ドメイン署名の生成（マニフェスト用）
npx @neynar/cli@latest sign-domain

# Webhook署名の検証
npx @neynar/cli@latest verify-webhook
```

### 開発コマンド
```bash
# 開発サーバー起動
pnpm dev

# マニフェストの確認
curl https://emoji-chat-leaps.vercel.app/.well-known/farcaster.json

# Webhookテスト
curl -X POST https://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

## 環境変数

### 必須環境変数
```env
# Neynar API（Farcaster開発に必須）
NEYNAR_API_KEY=your_api_key

# Farcaster関連（必要に応じて）
NEXT_PUBLIC_FARCASTER_APP_ID=
FARCASTER_WEBHOOK_SECRET=
```

## タスク実行時の確認事項

### ✅ 実装前チェックリスト
- [ ] Farcaster Mini Appコンテキスト内かどうか確認しているか？
- [ ] 通常のWebアクセスとMini Appアクセスの両方に対応しているか？
- [ ] Neynar APIキーは設定されているか？
- [ ] Webhook署名検証を実装しているか？

### ✅ 実装後チェックリスト
- [ ] Farcasterクライアント内でテストしたか？
- [ ] マニフェストファイルは有効か？（JSON構文チェック）
- [ ] Webhookエンドポイントは正しく応答しているか？
- [ ] ドメイン署名は最新か？
- [ ] 認証フローは正常に動作するか？

## トラブルシューティング

### よくある問題

#### 1. "Mini App context not found"
→ Farcasterクライアント外でアクセスしている可能性
→ コンテキスト確認後にフォールバック処理を実装

#### 2. "Invalid manifest signature"
→ `npx @neynar/cli sign-domain` で署名を再生成

#### 3. Webhookが受信されない
→ エンドポイントURL、署名検証、HTTPS設定を確認

#### 4. "Neynar API rate limit exceeded"
→ APIキーの使用状況を確認、キャッシング戦略を検討

#### 5. トランザクションが送信できない
→ Farcaster Wagmi Connectorが正しく設定されているか確認

## 注意事項

- **コンテキスト判定**: Mini App内かどうかを常に確認
- **フォールバック**: 通常のWebアクセスでも動作するように設計
- **署名管理**: ドメイン署名は定期的に更新が必要な場合がある
- **Webhook セキュリティ**: 必ず署名検証を実装
- **API制限**: Neynar APIのレート制限に注意
- **テスト環境**: 開発環境と本番環境で異なるマニフェストを使用

## 開発環境URL

- **本番**: `https://emoji-chat-leaps.vercel.app`
- **開発**: `https://emoji-chat-env-develop-leaps.vercel.app/`
- **Webhook**: `https://.../api/webhook`
