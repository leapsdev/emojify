# Farcaster Mini App Quick Start 🚀

## 概要

Emoji Chatは**Farcaster Mini App**として設定されており、Farcasterエコシステム内でネイティブに動作します。

## 現在の設定

### マニフェストファイル
- **場所**: `public/.well-known/farcaster.json`
- **形式**: Farcaster Frame仕様 v1
- **セクション**: `frame` + `accountAssociation`

### 主要設定
```json
{
  "frame": {
    "name": "Test Emoji Chat",
    "version": "1",
    "homeUrl": "https://emoji-chat-env-develop-leaps.vercel.app/",
    "webhookUrl": "https://emoji-chat-env-develop-leaps.vercel.app/api/webhook",
    "primaryCategory": "social"
  }
}
```

## 動作確認

### 1. マニフェストの確認
```bash
curl https://emoji-chat-leaps.vercel.app/.well-known/farcaster.json
```

### 2. Farcasterクライアントでのテスト
- Warpcast、Neynar等で「Test Emoji Chat」を検索
- ミニアプリとして起動確認

## 重要なポイント

- ✅ **Frame形式**: 最新のFarcaster仕様に準拠
- ✅ **アカウント連携**: ドメイン所有権が検証済み
- ✅ **Webhook対応**: リアルタイムイベント処理可能
- ✅ **開発環境**: 開発用URLが正しく設定済み

## 詳細情報

詳細な設定とセットアップについては、[FARCaster_SETUP.md](./FARCaster_SETUP.md)を参照してください。

## 参考リンク

- [Farcaster Mini Apps](https://miniapps.farcaster.xyz/)
- [Frames Documentation](https://docs-farcaster-xyz.vercel.app/developers/frames/)
- [Neynar](https://neynar.com/)
