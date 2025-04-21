# Emoji Chat 🎨💬

絵文字のみを使用したWeb3チャットアプリケーション。ユーザーは独自の絵文字を作成・販売でき、他のユーザーの絵文字を購入して使用することができます。

## 機能 🚀
[https://github.com/leapsdev/emoji-chat/issues/1](https://github.com/leapsdev/emoji-chat/issues/1)

### 認証機能
- Privyを使用したWeb3認証システム([1](https://docs.privy.io/guide/react/authentication/))
- メール、ウォレット、ソーシャルログインに対応

### チャット機能
- リアルタイムチャット
- グループチャット対応
- 絵文字のみでコミュニケーション

### 絵文字システム
- オリジナル絵文字の作成
- ブロックチェーン上での絵文字NFT化
- マーケットプレイスでの売買
- 絵文字検索機能

## 技術スタック 🛠

### フロントエンド
- [React](https://react.dev/) - UIライブラリ
- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Conform](https://conform.guide/) - フォームバリデーション
- [Zod](https://zod.dev/) - スキーマバリデーション

### バックエンド
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - エッジデータベース
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORMツール
- [Netlify](https://www.netlify.com/) - ホスティング

### Web3統合
- [Privy](https://docs.privy.io/) - Web3認証 & ウォレット管理

### 開発ツール
- [pnpm](https://pnpm.io/) - パッケージマネージャー
- [biome](https://biomejs.dev/) - コードフォーマッター

## プロジェクト構造 📁

### ディレクトリ構造
```
├── src/
│   ├── app/                   
│   │   ├── layout.tsx         
│   │   ├── (main)/           
│   │   ├── (auth)/           
│   │   └── refresh/          
│   ├── components/          
│   │   ├── ui/            
│   │   ├── providers/     
│   │   ├── shared/       
│   │   ├── features/     
│   │   └── pages/        
│   ├── lib/               
│   │   ├── firebase/     
│   │   ├── auth.ts      
│   │   ├── thirdweb.ts  
│   │   ├── usePrivy.ts  
│   │   └── utils.ts     
│   ├── repository/       
│   ├── types/           
│   ├── utils/           
│   ├── styles/          
│   └── middleware.ts    
├── contract/            
├── public/             
├── .wrangler/          
├── .github/            
├── .next/             
├── node_modules/      
├── .env              
├── .gitignore       
├── package.json      
├── next.config.ts    
├── tailwind.config.ts
├── tsconfig.json     
├── postcss.config.mjs
├── eslint.config.mjs 
├── biome.json        
├── components.json   
└── README.md         
```

## セットアップ 🔧

```bash
# リポジトリのクローン
git clone <repository-url>

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

## データベース 💾

### モデリング

[https://github.com/leapsdev/emoji-chat/issues/2](https://github.com/leapsdev/emoji-chat/issues/2)

### データベーススキーマ 

```typescript
// schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  address: text('address'),
  username: text('username'),
});

export const emojis = sqliteTable('emojis', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id'),
  tokenId: integer('token_id'),
  imageUrl: text('image_url'),
  price: integer('price'),
});
```

## 環境変数 🔐

## ライセンス 📄

MIT
