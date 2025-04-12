'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useImagePreview } from '../hooks/useImagePreview';

interface FileUploadProps {
  onFileChange?: (file: File | null) => void;
}

export function FileUpload({ onFileChange }: FileUploadProps) {
  const { previewUrl, handleFileSelect, reset } = useImagePreview();
  const inputRef = useRef<HTMLInputElement>(null);

  // ファイル変更を親コンポーネントに通知
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
    onFileChange?.(e.target.files?.[0] ?? null);
  };

  // リセット処理
  const handleReset = () => {
    reset();
    onFileChange?.(null);
    // input要素の値をリセット
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full h-0 pb-[100%] relative bg-gray-100 rounded-xl mb-6">
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        {previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              aria-label="Reset"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-labelledby="closeIconTitle"
              >
                <title id="closeIconTitle">Close icon</title>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400 mb-8" />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,video/quicktime,video/mp4"
          className="hidden"
          id="file-upload"
          onChange={handleChange}
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold cursor-pointer hover:bg-blue-600 transition-colors mt-4"
        >
          Choose file
        </label>
      </div>
    </div>
  );
}
