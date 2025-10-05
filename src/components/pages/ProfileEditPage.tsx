'use client';

import { ProfileEditForm } from '@/components/features/profile/edit/ProfileEditForm';
import { ProfileImage } from '@/components/features/profile/edit/ProfileImage';
import type { User } from '@/repository/db/database';
import { useRef, useState } from 'react';

interface ProfileEditPageProps {
  initialUser: User | null;
  walletAddress: string;
}

export function ProfileEditPage({
  initialUser,
  walletAddress,
}: ProfileEditPageProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialUser?.imageUrl || null,
  );

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
