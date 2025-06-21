import { Loading } from '@/components/ui/Loading';

/**
 * アプリケーション全体のローディングコンポーネント
 *
 * Next.js 15のloading.tsxファイルとして機能し、
 * アプリケーション全体のローディング状態を管理します。
 * Suspense境界での使用を想定しており、
 * 統一ローディングコンポーネントを使用して
 * 一貫したユーザーエクスペリエンスを提供します。
 *
 * @returns アプリケーション全体のローディングUI
 */
export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loading size="xl" className="mb-4" />
      </div>
    </div>
  );
}
