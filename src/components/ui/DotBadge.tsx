interface DotBadgeProps {
  className?: string;
}

export const DotBadge = ({
  className = 'w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0',
}: DotBadgeProps) => {
  return <div className={className} />;
};
