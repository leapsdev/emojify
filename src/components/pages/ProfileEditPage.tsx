'use client';

import { ProfileEditForm } from '@/components/features/profile/edit/ProfileEditForm';
import { ProfileImage } from '@/components/features/profile/edit/ProfileImage';
import type { User } from '@/repository/db/database';
import { useEffect, useRef, useState } from 'react';

interface ProfileEditPageProps {
  initialUser: User | null;
  walletAddress: string;
}

export function ProfileEditPage({
  initialUser,
  walletAddress,
}: ProfileEditPageProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // initialUserの変更を監視してimageUrlを同期
  useEffect(() => {
    const currentImageUrl = initialUser?.imageUrl || null;
    console.log(
      '📸 [ProfileEditPage] initialUser.imageUrl changed:',
      currentImageUrl,
    );
    setImageUrl(currentImageUrl);
  }, [initialUser?.imageUrl]);

  // imageUrlステートの変更を監視
  useEffect(() => {
    console.log('📸 [ProfileEditPage] imageUrl state updated:', imageUrl);
  }, [imageUrl]);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  return (
    <main className="flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
      <ProfileImage
        currentImageUrl={imageUrl}
        onImageUpload={handleImageUpload}
      />
      <ProfileEditForm
        user={initialUser}
        walletAddress={walletAddress}
        imageUrl={imageUrl}
        ref={formRef}
      />
    </main>
  );
}
