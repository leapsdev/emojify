import { Header as SharedHeader } from '@/components/shared/layout/header';

export function Header() {
  return (
    <SharedHeader
      backHref="/chat"
      centerContent={<span className="text-2xl">👦👧</span>}
    />
  );
}
