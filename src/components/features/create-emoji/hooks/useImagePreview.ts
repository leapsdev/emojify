'use client';

import { useState } from 'react';

interface UseImagePreviewReturn {
  file: File | null;
  previewUrl: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

export const useImagePreview = (): UseImagePreviewReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 以前のプレビューURLが存在する場合はクリーンアップ
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(selectedFile);
      });
      setFile(selectedFile);
    }
  };

  const reset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFile(null);
  };

  return {
    file,
    previewUrl,
    handleFileSelect,
    reset,
  };
};
