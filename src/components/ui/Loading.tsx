import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const loadingVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-16 h-16',
      xl: 'w-32 h-32',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  /** ローディングテキスト（オプション） */
  text?: string;
}

/**
 * 統一ローディングコンポーネント
 *
 * アプリケーション全体で使用できるシンプルなスピナーローディングコンポーネントです。
 * 4つのサイズバリエーションとテキスト表示機能を提供します。
 *
 * @example
 * ```tsx
 * // 基本的な使用
 * <Loading size="md" text="Loading..." />
 *
 * // テキストなし
 * <Loading size="lg" />
 *
 * // カスタムスタイル
 * <Loading
 *   size="lg"
 *   className="text-blue-600"
 *   text="データを取得中..."
 * />
 *
 * // 小さなサイズ（ボタン内など）
 * <Loading size="sm" />
 *
 * // 大きなサイズ（ページ全体のローディング）
 * <Loading size="xl" text="Loading..." />
 * ```
 *
 * @param size - スピナーのサイズ ('sm' | 'md' | 'lg' | 'xl')
 * @param text - 表示するローディングテキスト（オプション）
 * @param className - 追加のCSSクラス（オプション）
 *
 * @returns ローディングスピナーコンポーネント
 */
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-live="polite"
        aria-label={text || 'Loading...'}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          className,
        )}
        {...props}
      >
        <div className={cn(loadingVariants({ size }))}>
          <div
            className={cn(
              'animate-loading-spin rounded-full border-2 border-gray-200',
              'border-t-blue-500',
              size === 'sm' && 'w-4 h-4 border',
              size === 'md' && 'w-8 h-8 border-2',
              size === 'lg' && 'w-16 h-16 border-4',
              size === 'xl' && 'w-32 h-32 border-8',
            )}
          />
        </div>
        {text && (
          <span
            className={cn(
              'text-sm text-gray-600',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
              size === 'xl' && 'text-lg',
            )}
          >
            {text}
          </span>
        )}
      </div>
    );
  },
);

Loading.displayName = 'Loading';

export { Loading, loadingVariants };
