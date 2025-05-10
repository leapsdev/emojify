import { cn } from '@/lib/utils';
import Link from 'next/link';

type LinkButtonProps = {
  href: string;
  content: React.ReactNode;
  className?: string;
};

export const LinkButton = ({ href, content, className }: LinkButtonProps) => {
  return (
    <Link href={href} className={cn('text-2xl flex items-center', className)}>
      {content}
    </Link>
  );
};
