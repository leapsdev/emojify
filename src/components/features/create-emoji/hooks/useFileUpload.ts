'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルの拡張子を取得
      const extension = file.name.split('.').pop();
      // UUIDを生成し、元の拡張子を付与
      const newFileName = `${uuidv4()}.${extension}`;
      // 新しいFileオブジェクトを作成
      const renamedFile = new File([file], newFileName, { type: file.type });

      setSelectedFile(renamedFile);
      // プレビューURLを生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(renamedFile);
    } else {
      // ファイルが選択されていない場合はクリア
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return {
    selectedFile,
    preview,
    handleFileSelect,
    clearFile,
  };
}
