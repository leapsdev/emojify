'use client';
// import { AuthRedirect } from '@/components/features/auth/AuthRedirect';
import { ProfileForm } from '@/components/features/create-profile/ProfileForm';
import { ProfileImage } from '@/components/features/create-profile/ProfileImage';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import { useRef } from 'react';

export function CreateProfilePage() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageUpload = (url: string) => {
    if (!formRef.current) return;

    // 既存のimageUrl inputがあれば更新、なければ新規作成
    let imageUrlInput = formRef.current.querySelector(
      'input[name="imageUrl"]',
    ) as HTMLInputElement;
    if (!imageUrlInput) {
      imageUrlInput = document.createElement('input');
      imageUrlInput.type = 'hidden';
      imageUrlInput.name = 'imageUrl';
      formRef.current.appendChild(imageUrlInput);
    }
    imageUrlInput.value = url;
  };

  return (
    <EthereumProviders>
      <main className="max-w-2xl mx-auto w-full px-4 py-8">
        {/* <AuthRedirect mode="profile" /> */}
        <ProfileImage onImageUpload={handleImageUpload} />
        <ProfileForm ref={formRef} />
      </main>
    </EthereumProviders>
  );
}
