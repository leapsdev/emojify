/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef } from 'react';
import { ResetButton } from './ResetButton';

interface FileUploadProps {
  preview: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ preview, onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      onFileSelect({
        target: { files: null, value: '' } as unknown as HTMLInputElement,
        currentTarget: {
          files: null,
          value: '',
        } as unknown as HTMLInputElement,
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="w-full h-0 pb-[100%] relative bg-gray-100 rounded-xl mb-6">
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        <PreviewArea preview={preview} handleReset={handleReset} />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          id="file-upload"
          onChange={onFileSelect}
        />
      </div>
    </div>
  );
}

const PreviewArea = ({
  preview,
  handleReset,
}: {
  preview: string | null;
  handleReset: () => void;
}) => {
  if (preview) {
    return (
      <div className="relative w-full h-full">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-fill"
        />
        <ResetButton onClick={handleReset} />
      </div>
    );
  }

  return (
    <>
      <img
        src="/image-icon.png"
        alt="画像アイコン"
        className="mb-8"
        style={{ width: '4rem', height: '4rem', color: '#9ca3af' }}
      />
      <label
        htmlFor="file-upload"
        className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold cursor-pointer hover:bg-blue-600 transition-colors mt-4"
      >
        Choose file
      </label>
    </>
  );
};
