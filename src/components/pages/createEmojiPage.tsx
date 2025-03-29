'use client';

import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

export function CreateEmojiPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4">
        {/* 画像プレースホルダーエリア */}
        <div className="w-full h-0 pb-[100%] relative bg-gray-100 rounded-xl mb-6">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-8" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,video/quicktime,video/mp4"
              className="hidden"
              id="file-upload"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold cursor-pointer hover:bg-blue-600 transition-colors mt-4"
            >
              Choose file
            </label>
          </div>
        </div>

        {/* Createボタン */}
        <Button
          className="w-full bg-gray-900 text-white rounded-full py-6 text-lg font-bold hover:bg-gray-800"
          disabled={!selectedFile}
        >
          Create
        </Button>
      </div>
    </main>
  );
}
