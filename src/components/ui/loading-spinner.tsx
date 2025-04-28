'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}
