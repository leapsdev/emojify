'use client';

import { Plus, User2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useRef, useState } from 'react';
import { uploadImage } from './uploadImage';

interface ProfileImageProps {
  currentImageUrl?: string | null;
  onImageUpload?: (url: string) => void;
}

export function ProfileImage({
  currentImageUrl,
  onImageUpload,
}: ProfileImageProps) {
  const [isPending, setIsPending] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsPending(true);
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImage(formData);

      if (result.status === 'success' && result.url) {
        setImageUrl(result.url);
        onImageUpload?.(result.url);
      } else {
        console.error('Upload error:', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex justify-center">
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border overflow-hidden">
          {imageUrl ? (
            <CldImage
              width={128}
              height={128}
              src={imageUrl}
              alt="Profile Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <User2 className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isPending}
          className={`absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center ${
            isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
