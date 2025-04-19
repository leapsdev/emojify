'use client';

import { X } from 'lucide-react';

interface ResetButtonProps {
  onClick: () => void;
}

export function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
      aria-label="Reset"
    >
      <X className="w-6 h-6" />
    </button>
  );
}
