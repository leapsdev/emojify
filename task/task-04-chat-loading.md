# タスク4: ページ固有ローディングの実装（チャット）

## 目的
チャットページ専用のローディングファイルを作成する。

## 実装ファイル
- `src/app/(main)/chat/loading.tsx`

## 要件
- チャットページ固有のローディングUI
- 既存の統一ローディングコンポーネントの使用
- チャットページのレイアウトに合わせたデザイン

## 実装内容

### コンポーネント構造
```typescript
export default function ChatLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading 
        size="lg" 
        variant="spinner" 
        text="チャットを読み込み中..." 
      />
    </div>
  );
}
```

### スタイリング要件
- チャットページのレイアウトに合わせたデザイン
- 適切な背景色とテキスト色
- レスポンシブデザイン対応

## 実装手順

### 1. 基本ファイル構造の作成
- chat/loading.tsxファイルの作成
- デフォルトエクスポートの実装

### 2. チャットページ固有のレイアウト実装
- チャットページのレイアウトに合わせた配置
- 適切な背景色の設定

### 3. 統一ローディングコンポーネントの使用
- Loading.tsxコンポーネントのインポート
- チャットページに適したサイズとバリアントの設定
- チャット固有のテキストの設定

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] chat/loading.tsxファイルの実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] チャットページ固有のレイアウト実装
- [ ] アクセシビリティ対応
- [ ] チャットページでの動作確認

## テスト項目
- チャットページ遷移時のローディング表示
- チャットデータ取得時のローディング表示
- 異なるデバイスでの表示確認

## 注意事項
- チャットページの既存レイアウトとの整合性
- パフォーマンスを考慮した実装
- 既存のチャット機能への影響がないことの確認

## 参考実装例
```typescript
import { Loading } from '@/components/ui/Loading';

export default function ChatLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loading 
          size="lg" 
          variant="spinner" 
          text="チャットを読み込み中..." 
          className="mb-4"
        />
        <p className="text-gray-600 text-sm">
          メッセージを取得しています...
        </p>
      </div>
    </div>
  );
}
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- チャットページの既存レイアウト 