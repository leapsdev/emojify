import { cn } from '@/lib/utils';
import { LinkButton } from '@/components/ui/linkButton';

type HeaderProps = {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
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
  const backButton = (backHref || onBack) && (
    onBack ? (
      <button onClick={onBack} className="text-2xl">👈</button>
    ) : (
      <LinkButton
        href={backHref || ""}
        content="👈"
        className="text-2xl"
      />
    )
  );

  return (
    <div className={cn("relative flex items-center p-4 border-b", className)}>
      {/* 左エリア - 絶対位置で配置 */}
      <div className="absolute left-4">
        {leftContent || backButton}
      </div>

      {/* 中央エリア - flex-1で拡大、中央揃え */}
      <div className="flex-1 flex justify-center">
        {centerContent}
      </div>

      {/* 右エリア - 絶対位置で配置 */}
      <div className="absolute right-4">
        {rightContent}
      </div>
    </div>
  );
};
