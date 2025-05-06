import { LinkButton } from '@/components/ui/LinkButton';
import { cn } from '@/lib/utils';

/**
 * 共通ヘッダーコンポーネント
 *
 * @example
 * // 戻るボタンと中央タイトル
 * <Header
 *   backHref="/chat"
 *   centerContent={<h1 className="text-xl font-semibold">Title</h1>}
 * />
 *
 * // 中央アイコンのみ
 * <Header
 *   centerContent={<span className="text-2xl">💬</span>}
 * />
 *
 * // 戻るボタンと右側のメニュー
 * <Header
 *   backHref="/chat"
 *   rightContent={<MenuButton />}
 * />
 *
 * // useRouterを使用した戻るボタン
 * <Header
 *   onBack={() => router.push('/chat')}
 *   centerContent={<span>Title</span>}
 * />
 */
type HeaderProps = {
  /** 左側に表示するコンテンツ。指定がない場合、backHrefまたはonBackが指定されていれば戻るボタンが表示されます */
  leftContent?: React.ReactNode;
  /** 中央に表示するコンテンツ */
  centerContent?: React.ReactNode;
  /** 右側に表示するコンテンツ */
  rightContent?: React.ReactNode;
  /** 戻るボタンのリンク先。next/linkを使用したナビゲーション */
  backHref?: string;
  /** 戻るボタンのクリックハンドラ。useRouterを使用したナビゲーション */
  onBack?: () => void;
  /** 追加のスタイルクラス */
  className?: string;
};

export const Header = ({
  leftContent,
  centerContent,
  rightContent,
  backHref,
  onBack,
  className,
}: HeaderProps) => {
  const backButton =
    (backHref || onBack) &&
    (onBack ? (
      <button type="button" onClick={onBack} className="text-2xl">
        👈
      </button>
    ) : (
      <LinkButton href={backHref || ''} content="👈" className="text-2xl" />
    ));

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white',
        'flex items-center h-14 p-4 border-b',
        className,
      )}
    >
      {/* 左エリア - 絶対位置で配置 */}
      <div className="absolute left-4 h-full flex items-center">
        {leftContent || backButton}
      </div>

      {/* 中央エリア - flex-1で拡大、中央揃え */}
      <div className="flex-1 flex justify-center items-center h-full">
        {centerContent}
      </div>

      {/* 右エリア - 絶対位置で配置 */}
      <div className="absolute right-4 h-full flex items-center">
        {rightContent}
      </div>
    </div>
  );
};
