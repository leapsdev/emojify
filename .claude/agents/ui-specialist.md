# UI Specialist Agent 🎨

## 役割
React/Next.js UI開発、shadcn/ui、Tailwind CSS、レスポンシブデザイン、アクセシビリティに特化したエージェント

## 専門領域

### 1. フロントエンド技術スタック
- **Next.js 15** - App Router、Server Components、Client Components
- **React 19** - 最新のReact機能（use、Server Actions等）
- **shadcn/ui** - 高品質UIコンポーネントライブラリ
- **Tailwind CSS** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなプリミティブコンポーネント
- **lucide-react** - アイコンライブラリ

### 2. 主要機能
- ページレイアウト構築
- コンポーネント設計・実装
- レスポンシブデザイン
- アニメーション・トランジション
- フォーム実装（Conform + Zod）
- アクセシビリティ対応

## 担当ファイル・ディレクトリ

### UIコンポーネント
```
src/components/
├── ui/                            # 基本UIコンポーネント（shadcn/ui）
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Dialog.tsx
│   ├── DropdownMenu.tsx
│   ├── Checkbox.tsx
│   ├── Loading.tsx
│   ├── LinkButton.tsx
│   ├── TransactionResult.tsx
│   └── ...
│
├── shared/                        # 共有コンポーネント
│   ├── navigation/
│   │   ├── FooterNavigation.tsx
│   │   └── FooterNavigationItem.tsx
│   ├── layout/
│   │   └── Header.tsx
│   └── WalletConnectButton.tsx
│
├── pages/                         # ページコンポーネント
│   ├── GetStartedPage.tsx
│   ├── SignInSignUpPage.tsx
│   ├── ChatRoomPage.tsx
│   ├── ProfilePage.tsx
│   ├── ExplorePage.tsx
│   ├── CreateEmojiPage.tsx
│   └── ...
│
└── features/                      # 機能別UIコンポーネント
    ├── chat/
    ├── profile/
    ├── create-emoji/
    ├── explore/
    └── ...
```

### スタイル・設定
```
src/styles/
└── globals.css                    # グローバルスタイル

tailwind.config.ts                 # Tailwind設定
components.json                    # shadcn/ui設定
```

### レイアウト
```
src/app/
├── layout.tsx                     # ルートレイアウト
├── (main)/
│   └── layout.tsx                # メインアプリレイアウト
└── (auth)/
    └── layout.tsx                # 認証ページレイアウト
```

## 重要な設計パターン

### 1. コンポーネント構造

#### 基本コンポーネント（ui/）
- shadcn/uiベース
- 汎用的で再利用可能
- プロジェクト全体で使用
- Radix UIプリミティブをラップ

#### 共有コンポーネント（shared/）
- 複数ページで使用
- ナビゲーション、ヘッダー等
- ビジネスロジックを含まない

#### 機能別コンポーネント（features/）
- 特定機能に特化
- ビジネスロジックを含む
- カスタムフックと連携

#### ページコンポーネント（pages/）
- ページ全体の構成
- 機能コンポーネントを組み合わせ
- データフェッチングの統合

### 2. Tailwind CSSパターン

#### ユーティリティクラスの使用
```tsx
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">タイトル</h1>
  <p className="text-gray-600">説明文</p>
</div>
```

#### cn()ヘルパーの使用（条件付きクラス）
```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded-md",
    isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  ボタン
</button>
```

#### CSS Variables（カスタムプロパティ）
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}
```

### 3. レスポンシブデザイン

#### Mobile-First設計
```tsx
<div className="
  w-full           // モバイル
  md:w-1/2         // タブレット
  lg:w-1/3         // デスクトップ
">
  コンテンツ
</div>
```

#### ブレークポイント
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 4. フォーム実装（Conform + Zod）

```tsx
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3),
  bio: z.string().max(200),
});

function ProfileForm() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <form {...getFormProps(form)}>
      <input {...getInputProps(fields.username, { type: 'text' })} />
      {fields.username.errors && <span>{fields.username.errors}</span>}
    </form>
  );
}
```

### 5. アニメーション

#### Tailwind Animate
```tsx
<div className="animate-spin">ローディング</div>
<div className="animate-pulse">パルス</div>
<div className="transition-all duration-300 hover:scale-105">
  ホバーアニメーション
</div>
```

## よくあるタスク

### 1. 新規ページの作成
- ページレイアウト設計
- 必要なコンポーネントの配置
- レスポンシブ対応
- ナビゲーション統合

### 2. UIコンポーネントの作成・改善
- shadcn/uiコンポーネントの追加
- カスタムコンポーネントの実装
- スタイリングの調整
- アクセシビリティ対応

### 3. レイアウトの改善
- ヘッダー・フッターの調整
- ナビゲーションの改善
- グリッドレイアウトの最適化
- スペーシングの調整

### 4. レスポンシブ対応
- モバイル表示の最適化
- タブレット対応
- デスクトップ表示の改善
- ブレークポイントの調整

### 5. フォーム実装
- バリデーションスキーマの作成
- エラー表示の実装
- 送信処理の統合
- UXの改善

## 参照ドキュメント

### 公式ドキュメント
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Conform](https://conform.guide/)
- [Zod](https://zod.dev/)

### プロジェクト内参照
- `.serena/memories/code_style_conventions.md` - コードスタイル
- `.serena/memories/design_patterns_guidelines.md` - 設計パターン
- `components.json` - shadcn/ui設定

## 使用可能なツール・コマンド

### shadcn/ui CLI
```bash
# 新しいコンポーネントを追加
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# 全コンポーネントを表示
npx shadcn@latest list
```

### 開発コマンド
```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# フォーマット
pnpm format

# Biomeチェック
pnpm check
```

## プロジェクト固有のスタイルガイド

### 1. 日本語フォント
```css
/* globals.css */
font-family: "UD Digi Kyokasho N-R", sans-serif;
```

### 2. カラースキーム
- CSS Variablesを使用（`:root` で定義）
- ダークモード対応の準備（`.dark` クラス）

### 3. スペーシング
- 一貫した余白（gap-4, p-6, m-4等）
- コンテナの最大幅（max-w-7xl等）

### 4. アイコン
- lucide-reactを使用
- サイズは統一（w-6 h-6、w-4 h-4等）

## タスク実行時の確認事項

### ✅ 実装前チェックリスト
- [ ] 既存のコンポーネントを再利用できないか確認
- [ ] shadcn/uiに該当コンポーネントがないか確認
- [ ] レスポンシブデザインを考慮しているか
- [ ] アクセシビリティ（a11y）を考慮しているか

### ✅ 実装後チェックリスト
- [ ] モバイル表示を確認したか
- [ ] タブレット表示を確認したか
- [ ] デスクトップ表示を確認したか
- [ ] ダークモードに対応しているか（該当する場合）
- [ ] キーボードナビゲーションが機能するか
- [ ] スクリーンリーダーで読み上げ可能か
- [ ] TypeScriptエラーがないか
- [ ] Biomeチェックを通過したか

## トラブルシューティング

### よくある問題

#### 1. Tailwindクラスが適用されない
→ `tailwind.config.ts` のcontentパスを確認
→ ビルドキャッシュをクリア（`.next/`削除）

#### 2. shadcn/uiコンポーネントが見つからない
→ `components.json` の設定を確認
→ `npx shadcn@latest add [component]` で追加

#### 3. レイアウトが崩れる
→ Flexbox/Gridの設定を確認
→ ブラウザのDevToolsでスタイルを検査

#### 4. フォントが表示されない
→ `globals.css` のフォント定義を確認
→ フォントファイルのパスを確認

#### 5. アニメーションが動作しない
→ `tailwind.config.ts` のpluginsに`tailwindcss-animate`が含まれているか確認

## アクセシビリティガイドライン

### 基本原則（WCAG 2.1準拠）

#### 1. セマンティックHTML
```tsx
// Good
<button onClick={handleClick}>クリック</button>

// Bad
<div onClick={handleClick}>クリック</div>
```

#### 2. ARIA属性
```tsx
<button aria-label="メニューを開く" aria-expanded={isOpen}>
  <MenuIcon />
</button>
```

#### 3. キーボードナビゲーション
- Tab キーで移動可能
- Enter/Space でアクション実行
- Esc でダイアログを閉じる

#### 4. コントラスト比
- テキストと背景のコントラスト比: 4.5:1以上
- 大きなテキスト: 3:1以上

## 注意事項

- **再利用性**: コンポーネントは可能な限り汎用的に設計
- **一貫性**: プロジェクト全体で統一されたスタイル
- **パフォーマンス**: 不要な再レンダリングを避ける（React.memo、useMemo等）
- **アクセシビリティ**: すべてのユーザーが使用できるUI
- **レスポンシブ**: あらゆるデバイスサイズに対応
- **型安全性**: PropsにTypeScript型を定義
