# タスク2: ローディングフックの作成

## 目的
ローディング状態を管理するカスタムフックを作成し、コンポーネント間でローディング状態を共有できるようにする。

## 実装ファイル
- `src/lib/hooks/useLoading.ts`

## 機能
- ローディング状態の管理
- デバウンス機能
- エラーハンドリング
- ローディング時間の測定

## 実装内容

### インターフェース定義
```typescript
interface UseLoadingOptions {
  debounceMs?: number;
  minLoadingTime?: number;
  onError?: (error: Error) => void;
}

interface UseLoadingReturn {
  isLoading: boolean;
  error: Error | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: Error) => void;
  clearError: () => void;
  loadingTime: number;
}
```

### オプション定義
- `debounceMs`: デバウンス時間（デフォルト: 100ms）
- `minLoadingTime`: 最小ローディング時間（デフォルト: 500ms）
- `onError`: エラー発生時のコールバック

## 実装手順

### 1. 基本フック構造の作成
- useLoadingフックの基本構造
- 状態管理の実装（isLoading, error, loadingTime）

### 2. ローディング状態管理の実装
- startLoading関数の実装
- stopLoading関数の実装
- ローディング時間の測定

### 3. デバウンス機能の実装
- setTimeoutを使用したデバウンス
- 最小ローディング時間の保証

### 4. エラーハンドリングの実装
- setError関数の実装
- clearError関数の実装
- エラーコールバックの実行

### 5. クリーンアップ機能の実装
- useEffectを使用したクリーンアップ
- メモリリークの防止

## 完了条件
- [ ] useLoadingフックの実装
- [ ] デバウンス機能の実装
- [ ] エラーハンドリングの実装
- [ ] ローディング時間測定の実装
- [ ] 基本的な使用例の確認
- [ ] クリーンアップ機能の実装

## テスト項目
- ローディング状態の切り替え確認
- デバウンス機能の動作確認
- エラーハンドリングの動作確認
- ローディング時間の測定確認
- クリーンアップ機能の確認

## 注意事項
- React Hooksのルールに従った実装
- メモリリークを防ぐためのクリーンアップ
- パフォーマンスを考慮したデバウンス実装
- TypeScriptの型安全性の確保

## 参考実装例
```typescript
// 基本的な使用例
const { isLoading, error, startLoading, stopLoading } = useLoading();

// デバウンス付きの使用例
const { isLoading, error, startLoading, stopLoading } = useLoading({
  debounceMs: 200,
  minLoadingTime: 1000,
  onError: (error) => console.error('Loading error:', error)
});

// 使用例
const handleDataFetch = async () => {
  startLoading();
  try {
    const data = await fetchData();
    // データ処理
  } catch (error) {
    setError(error as Error);
  } finally {
    stopLoading();
  }
};
```

## 依存関係
- React (useState, useEffect, useCallback)
- TypeScript
- 既存のプロジェクト設定 