# タスク13: 高優先度コンポーネントの更新（CollectEmojiPage）

## 目的
CollectEmojiPageコンポーネントで統一ローディングコンポーネントを使用するように更新する。

## 更新ファイル
- `src/components/pages/CollectEmojiPage.tsx`

## 変更内容
- 既存のスピナー実装を統一ローディングコンポーネントに置き換え
- ローディングフックの使用
- アクセシビリティ対応
- **コメント以外のテキストは英語で統一**

## 実装手順

### 1. 既存ローディング部分の特定
- `animate-spin`や`border-purple-500`などの既存スピナーを検索
- ローディング状態の判定箇所を特定

### 2. 統一ローディングコンポーネントへの置き換え
- `<Loading size="lg" text="Loading emoji details..." />` などに置き換え
- 必要に応じてpropsを調整

### 3. ローディングフックの導入
- `useLoading`フックを導入し、状態管理を統一

### 4. アクセシビリティ対応
- `role="status"`や`aria-label`の追加

## 完了条件
- [ ] 既存スピナーの完全な置き換え
- [ ] ローディングフックの導入
- [ ] アクセシビリティ属性の追加
- [ ] 英語統一の実装
- [ ] 動作確認

## テスト項目
- ローディング時の表示確認
- エラー時の表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- 既存のCollectEmojiPageのUI・ロジックを壊さないこと
- 他のコンポーネントへの影響がないこと
- パフォーマンスを考慮した実装

## 参考実装例
```typescript
import { Loading } from '@/components/ui/Loading';
import { useLoading } from '@/lib/hooks/useLoading';

// ...
if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loading size="lg" text="Loading emoji details..." />
    </div>
  );
} 