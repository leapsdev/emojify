import { Header as SharedHeader } from '@/components/shared/layout/header';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <SharedHeader
      className="mb-12 border-0"
      centerContent={<div className="text-7xl">🤪</div>}
    />
  );
};

export default Header;
