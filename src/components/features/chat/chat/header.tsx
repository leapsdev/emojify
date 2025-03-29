import { Header as SharedHeader } from '@/components/shared/layout/header';

export const Header = () => {
  return (
    <SharedHeader
      centerContent={<span className="text-2xl">💬</span>}
    />
  );
};
