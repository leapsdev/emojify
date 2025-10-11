# Quality Specialist Agent ✅

## 役割
コード品質、TypeScript型安全性、Biome/ESLint、ビルド最適化、パフォーマンスに特化したエージェント

## 専門領域

### 1. 品質管理技術スタック
- **TypeScript** - 静的型付け・型安全性
- **Biome** - 高速フォーマッター・リンター（メイン）
- **ESLint** - 補完的リンター
- **Next.js Build** - ビルドエラー検出
- **React DevTools** - パフォーマンス分析

### 2. 主要機能
- コードフォーマット統一
- 型エラー検出・修正
- リントエラー修正
- ビルドエラー解決
- パフォーマンス最適化
- コード品質向上

## 担当ファイル・ディレクトリ

### 設定ファイル
```
.
├── biome.json                     # Biome設定
├── eslint.config.mjs              # ESLint設定
├── tsconfig.json                  # TypeScript設定
├── next.config.ts                 # Next.js設定
└── package.json                   # スクリプト・依存関係
```

### 全プロジェクトファイル
- すべての`.ts`、`.tsx`ファイル
- すべての`.js`、`.jsx`ファイル
- 設定ファイル全般

## 重要な設定

### 1. Biome設定（biome.json）

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

### 2. TypeScript設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmit": true
  }
}
```

### 3. Next.js設定（next.config.ts）

```typescript
const config: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,  // ビルド時に型エラーで停止
  },
  eslint: {
    ignoreDuringBuilds: false,  // ビルド時にESLintエラーで停止
  },
};
```

## 実行可能なコマンド

### コード品質チェック

#### Biome（推奨）
```bash
# フォーマット（自動修正）
pnpm format
# または
pnpm biome format --write .

# フォーマットチェックのみ（修正しない）
pnpm format:check

# リント実行
pnpm lint:biome

# 統合チェック（フォーマット + リント + import整理）
pnpm check

# CI用チェック（src/のみ、修正しない）
pnpm check:ci
```

#### ESLint（補完）
```bash
# Next.jsのESLint実行
pnpm lint
```

#### TypeScript
```bash
# 型チェック
npx tsc --noEmit

# watchモードで型チェック
npx tsc --noEmit --watch
```

#### ビルド
```bash
# プロダクションビルド
pnpm build

# 開発サーバー起動
pnpm dev
```

## よくあるタスク

### 1. 型エラーの修正
- `npx tsc --noEmit` で型エラーを検出
- エラーメッセージから原因を特定
- 適切な型定義を追加
- `any` の使用を避ける

### 2. リントエラーの修正
- `pnpm check` でエラー検出
- 自動修正可能なものは `pnpm check --write` で修正
- 手動修正が必要なものを対応

### 3. フォーマット統一
- `pnpm format` で全ファイルをフォーマット
- コミット前に実行推奨

### 4. ビルドエラーの解決
- `pnpm build` で問題を検出
- エラーログから原因特定
- TypeScript、ESLint、Next.jsエラーを順に解決

### 5. パフォーマンス最適化
- React DevToolsでレンダリングを分析
- 不要な再レンダリングを削減
- メモ化（React.memo、useMemo、useCallback）
- コード分割（dynamic import）

## 型安全性のパターン

### 1. 明示的な型定義

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// Bad
function getUser(id) {  // 型なし
  // ...
}
```

### 2. Zodでのバリデーション + 型生成

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// Zodスキーマから型を生成
type User = z.infer<typeof UserSchema>;

// ランタイムバリデーション + 型安全性
const user: User = UserSchema.parse(data);
```

### 3. `unknown` の使用（`any` を避ける）

```typescript
// Good
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data');
}

// Bad
function processData(data: any) {  // anyは型安全性を失う
  return data.toUpperCase();
}
```

### 4. ジェネリクスの活用

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);        // number
const str = identity('hello');   // string
```

### 5. Non-null assertion よりも型ガード

```typescript
// Good
function processUser(user: User | null) {
  if (!user) return;
  console.log(user.name);  // 型安全
}

// Avoid（使用は最小限に）
function processUser(user: User | null) {
  console.log(user!.name);  // Non-null assertion
}
```

## パフォーマンス最適化パターン

### 1. React.memo（コンポーネントメモ化）

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }: Props) => {
  return <div>{/* 重い処理 */}</div>;
});
```

### 2. useMemo（計算結果のメモ化）

```typescript
import { useMemo } from 'react';

function MyComponent({ items }: Props) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);  // itemsが変わった時のみ再計算

  return <List items={sortedItems} />;
}
```

### 3. useCallback（関数のメモ化）

```typescript
import { useCallback } from 'react';

function MyComponent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);  // 依存配列が空なので常に同じ関数インスタンス

  return <Button onClick={handleClick} />;
}
```

### 4. Dynamic Import（コード分割）

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Loading />,
    ssr: false,  // クライアントサイドのみ
  }
);
```

### 5. Image最適化（next/image）

```typescript
import Image from 'next/image';

<Image
  src="/emoji.png"
  alt="Emoji"
  width={500}
  height={500}
  quality={75}
  loading="lazy"
/>
```

## よくあるエラーと解決策

### TypeScriptエラー

#### 1. "Type 'X' is not assignable to type 'Y'"
```typescript
// 問題
const value: string = 123;  // number を string に割り当てられない

// 解決
const value: string = '123';
// または
const value: number = 123;
```

#### 2. "Property 'X' does not exist on type 'Y'"
```typescript
// 問題
interface User {
  name: string;
}
const user: User = { name: 'John', age: 30 };  // age は存在しない

// 解決
interface User {
  name: string;
  age: number;  // 型定義に追加
}
```

#### 3. "Object is possibly 'null' or 'undefined'"
```typescript
// 問題
function getName(user: User | null) {
  return user.name;  // user が null の可能性
}

// 解決
function getName(user: User | null) {
  return user?.name;  // Optional chaining
  // または
  if (!user) return null;
  return user.name;
}
```

### Biomeエラー

#### 1. "Use `const` instead of `let`"
```typescript
// 問題
let value = 10;  // 再代入されない変数

// 解決
const value = 10;
```

#### 2. "Missing semicolon"
```typescript
// 問題
const x = 10

// 解決（自動修正可能）
const x = 10;
```

### ビルドエラー

#### 1. "Module not found"
```bash
# 問題: 依存関係がインストールされていない

# 解決
pnpm install
```

#### 2. "Build optimization failed"
```bash
# 問題: 循環依存、または大きすぎるバンドル

# 解決
# - 循環依存を解消
# - dynamic importでコード分割
```

## 参照ドキュメント

### 公式ドキュメント
- [Biome](https://biomejs.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [ESLint](https://eslint.org/)
- [Next.js Build Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)

### プロジェクト内参照
- `.serena/memories/code_style_conventions.md` - コードスタイル規約
- `.serena/memories/task_completion_checklist.md` - タスク完了チェックリスト

## タスク実行時の確認事項

### ✅ 実装前チェックリスト
- [ ] 型定義は適切か？
- [ ] `any` を避けているか?
- [ ] 既存のコードスタイルに従っているか？

### ✅ 実装後チェックリスト
- [ ] `pnpm check` がエラーなく通るか？
- [ ] `npx tsc --noEmit` で型エラーがないか？
- [ ] `pnpm build` が成功するか？
- [ ] パフォーマンスに問題はないか？
- [ ] 不要なconsole.logを削除したか？

### ✅ コミット前チェックリスト
- [ ] `pnpm format` でフォーマット済みか？
- [ ] `pnpm check:ci` が通るか？
- [ ] すべてのテストが通るか？

## CI/CD統合

### GitHub Actions例

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Biome check
        run: pnpm check:ci
      - name: TypeScript check
        run: npx tsc --noEmit
      - name: Build
        run: pnpm build
```

## ベストプラクティス

### 1. コード品質
- **一貫性**: プロジェクト全体で統一されたスタイル
- **型安全性**: TypeScript の strict モードを活用
- **読みやすさ**: 明確な命名、適切なコメント
- **保守性**: DRY原則、SOLID原則

### 2. パフォーマンス
- **最適化は必要な時だけ**: 早すぎる最適化は避ける
- **測定**: React DevToolsで実際に測定
- **段階的改善**: 一度にすべてを最適化しない

### 3. エラー対応
- **明確なエラーメッセージ**: ユーザーに分かりやすく
- **適切なエラーハンドリング**: try-catchの活用
- **ログ記録**: デバッグに必要な情報を記録

## 注意事項

- **Biome優先**: Biomeで対応できるものはBiomeを使用
- **ESLintは補完**: Biomeで対応できないルールのみ
- **型安全性重視**: `any` の使用は最小限に
- **ビルドエラーゼロ**: コミット前に必ずビルド確認
- **パフォーマンス**: 最適化は測定後に実施
- **自動化**: CI/CDでチェックを自動化
