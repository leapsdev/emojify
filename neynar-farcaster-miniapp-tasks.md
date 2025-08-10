# Farcaster Mini App 導入タスク（完全版）

## 調査結果：必須要件が判明
Farcaster Mini Appには以下が**必須**です：

## 必須タスクリスト

### 1. Farcaster Mini App SDK導入
```bash
# Neynar React SDK（推奨）
pnpm add @neynar/react

# Wagmi連携用
pnpm add @farcaster/miniapp-wagmi-connector
```

### 2. 環境変数設定
```env
# .env.local に追加
NEYNAR_API_KEY=your_neynar_api_key_here
```

### 3. MiniAppProvider設定
- `src/app/layout.tsx`で全体をMiniAppProviderでラップ
- analytics有効化

### 4. useMiniAppフック実装
- SDK初期化
- `sdk.actions.ready()`呼び出し（必須）
- コンテキスト取得

### 5. Neynarプロファイル取得関数作成
- `src/lib/neynar.ts` - NeynarAPIClient設定
- プロファイル取得メソッドのみ実装
- エラーハンドリング

### 6. farcaster.jsonマニフェスト作成
- `public/.well-known/farcaster.json`に配置
- アプリメタデータ設定
- accountAssociation（ドメイン所有権証明）

### 7. Metaタグ追加
- `fc:frame`メタタグでEmbed JSON設定
- imageUrl（3:2比率）
- buttonTitle設定

### 8. Wagmiコネクタ設定
- 既存のWagmi設定にfarcasterMiniAppコネクタ追加
- ウォレット統合

### 9. 動作確認
- FarcasterでMini App表示テスト
- SDK読み込み確認
- 各機能動作確認

## 重要な発見
- **Neynar APIキー必要** - プロファイル取得のため必要
- **@neynar/react**が推奨SDK
- **ready()呼び出し必須** - しないと無限ローディング
- **manifest必須** - /.well-known/farcaster.json
- **Meta tag必須** - fc:frameでEmbed設定

## 成功指標
- [ ] @neynar/reactがインストールされる
- [ ] MiniAppProviderが設定される
- [ ] ready()が正常に呼ばれる
- [ ] farcaster.jsonマニフェストが配置される
- [ ] fc:frameメタタグが設定される
- [ ] FarcasterでMini Appとしてアクセスできる