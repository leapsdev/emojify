import Link from 'next/link';
import { cn } from '@/lib/utils';

type LinkButtonProps = {
  href: string;
  content: string;
  className?: string;
};

export const LinkButton = ({ href, content, className }: LinkButtonProps) => {
  return (
    <Link href={href} className={cn('text-2xl', className)}>{content}</Link>
  );
};
