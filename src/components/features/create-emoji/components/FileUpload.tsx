'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  preview: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ preview, onFileSelect }: FileUploadProps) {
  return (
    <div className="w-full h-0 pb-[100%] relative bg-gray-100 rounded-xl mb-6">
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400 mb-8" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,video/quicktime,video/mp4"
          className="hidden"
          id="file-upload"
          onChange={onFileSelect}
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
