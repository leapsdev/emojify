import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { FC } from 'react';

const Footer: FC = () => {
  return (
    <div className="space-y-6">
      <Link href="/signup" className="w-full">
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-xl font-black">
          Get started
        </Button>
      </Link>
    </div>
  );
};

export default Footer;
