'use client';

import { Button } from '@/components/ui/Button';

interface CreateButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  loading?: boolean;
}

export function CreateButton({
  disabled,
  onClick,
  loading = false,
}: CreateButtonProps) {
  return (
    <Button
      className="w-full bg-gray-900 text-white rounded-full py-6 text-lg font-bold hover:bg-gray-800 disabled:bg-gray-400"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Creating...' : 'Create'}
    </Button>
  );
}
