'use client';

import { ProfileEditForm } from '@/components/features/profile/edit/ProfileEditForm';
import { ProfileImage } from '@/components/features/profile/edit/ProfileImage';
import type { User } from '@/repository/db/database';
import { useRef } from 'react';

interface ProfileEditPageProps {
  initialUser: User | null;
  walletAddress: string;
}

export function ProfileEditPage({
  initialUser,
  walletAddress,
}: ProfileEditPageProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageUpload = (url: string) => {
    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'hidden';
    imageUrlInput.name = 'imageUrl';
    imageUrlInput.value = url;

    formRef.current?.appendChild(imageUrlInput);
  };

  return (
    <main className="flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
      <ProfileImage
        currentImageUrl={initialUser?.imageUrl || ''}
        onImageUpload={handleImageUpload}
      />
      <ProfileEditForm
        user={initialUser}
        walletAddress={walletAddress}
        ref={formRef}
      />
    </main>
  );
}
