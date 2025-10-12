'use client';
import { AuthRedirect } from '@/components/features/auth/AuthRedirect';
import { ProfileForm } from '@/components/features/create-profile/ProfileForm';
import { ProfileImage } from '@/components/features/create-profile/ProfileImage';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function CreateProfilePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const router = useRouter();

  // 認証状態のチェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 未認証の場合はホームページにリダイレクト
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中または未認証の場合はローディング画面を表示
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
      </div>
    );
  }

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
    <main className="max-w-2xl mx-auto w-full px-4 py-8">
      <AuthRedirect mode="profile" />
      <ProfileImage onImageUpload={handleImageUpload} />
      <ProfileForm ref={formRef} />
    </main>
  );
}
