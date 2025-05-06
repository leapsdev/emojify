'use client';

import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface InstallButtonProps {
  onClick: () => void;
}

export const InstallButton = ({ onClick }: InstallButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <Download className="mr-2 h-5 w-5" />
      Install app
    </Button>
  );
};
