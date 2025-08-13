# Farcaster Mini App Setup Guide 🚀

このドキュメントでは、Emoji ChatアプリケーションのFarcaster Mini App設定について詳しく説明します。

## 概要

Emoji Chatは**Farcaster Mini App**として動作し、Farcasterエコシステム内でネイティブに統合されています。

## 重要な変更点

### 1. セクション名の変更
- **以前**: `miniapp` セクション
- **現在**: `frame` セクション

これはFarcasterの最新仕様に準拠した変更です。

### 2. 構造の更新
```json
{
  "frame": {
    "name": "Test Emoji Chat",
    "version": "1",
    "iconUrl": "https://emoji-chat-leaps.vercel.app/icons/icon-512x512.png",
    "homeUrl": "https://emoji-chat-env-develop-leaps.vercel.app/",
    "imageUrl": "https://emoji-chat-leaps.vercel.app/icons/icon-512x512.png",
    "splashImageUrl": "https://emoji-chat-leaps.vercel.app/icons/icon-512x512.png",
    "splashBackgroundColor": "#FFFFFF",
    "webhookUrl": "https://emoji-chat-env-develop-leaps.vercel.app/api/webhook",
    "subtitle": "test",
    "description": "test",
    "primaryCategory": "social"
  },
  "accountAssociation": {
    "header": "eyJmaWQiOjI0NTI2MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5RmY2QTQxMDU5ZTc3NENmMTlhRTEzNDZDMkZkQjAwYmE5OUFmZDQifQ",
    "payload": "eyJkb21haW4iOiJodHRwcyJ9",
    "signature": "hDibr8+8PkFaLTOGB8eeubqak4SvOkc2xFYJLGgFqqoo+qi/rLi5NdVbFROmo26ev6Ivzmz7qALuMGgrKoWzlxs="
  }
}
```

## 設定項目の詳細

### Frame セクション

#### 必須フィールド
- **version**: マニフェストのバージョン（"1"固定）
- **name**: アプリ名（最大32文字）
- **homeUrl**: デフォルト起動URL（最大1024文字）
- **iconUrl**: アイコン画像URL（1024x1024px PNG、アルファなし）

#### オプションフィールド
- **imageUrl**: フィード共有時のデフォルト画像（3:2アスペクト比）
- **splashImageUrl**: ローディング画面の画像（200x200px）
- **splashBackgroundColor**: ローディング画面の背景色（16進数）
- **webhookUrl**: イベント受信用のWebhook URL
- **subtitle**: アプリ名下の短い説明（最大30文字）
- **description**: Mini App Page用の宣伝メッセージ（最大170文字）
- **primaryCategory**: アプリの主要カテゴリ（social, games, finance等）

### Account Association セクション

このセクションは、ドメインの所有権をFarcasterアカウントで検証するために使用されます。

- **header**: base64エンコードされたJFSヘッダー
- **payload**: base64エンコードされたペイロード
- **signature**: base64エンコードされた署名

## 環境設定

### 開発環境
- **URL**: `https://emoji-chat-env-develop-leaps.vercel.app/`
- **Webhook**: `/api/webhook`

### 本番環境
- **URL**: `https://emoji-chat-leaps.vercel.app`
- **Webhook**: `/api/webhook`

## Webhook設定

Webhookエンドポイントは以下のイベントを処理します：

- ユーザー通知の購読/購読解除
- アプリ内でのアクション
- リアルタイムイベント

## 検証とテスト

### 1. マニフェストの検証
```bash
# マニフェストファイルが正しく配置されているか確認
curl https://emoji-chat-leaps.vercel.app/.well-known/farcaster.json
```

### 2. Farcasterクライアントでのテスト
- Warpcast、Neynar等のFarcasterクライアントでアプリを検索
- ミニアプリとして正常に起動するか確認
- アプリアイコン、説明、スクリーンショットが正しく表示されるか確認

## トラブルシューティング

### よくある問題

1. **マニフェストが読み込まれない**
   - `.well-known/farcaster.json`のパスが正しいか確認
   - ファイルのJSON形式が正しいか確認

2. **アカウント連携エラー**
   - `accountAssociation`の署名が有効か確認
   - ドメイン名が正しく設定されているか確認

3. **Webhookエラー**
   - Webhook URLが正しく設定されているか確認
   - エンドポイントが正常に動作しているか確認

## 参考資料

- [Farcaster Mini Apps Specification](https://miniapps.farcaster.xyz/docs/specification)
- [Frames Introduction](https://docs-farcaster-xyz.vercel.app/developers/frames/)
- [Neynar Documentation](https://docs.neynar.com/)

## 更新履歴

- **2024年**: Farcasterから発行された新しいマニフェストに更新
- **変更内容**: `miniapp` → `frame`セクション、開発環境URLの更新、アカウント連携情報の更新
