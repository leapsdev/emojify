'use client';

import { getPrivyId } from '@/lib/auth';
import { getUser } from '@/repository/user/actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileEditForm } from '../features/profile/edit/profileEditForm';
import type { User } from '@/types/database';

export function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const privyId = await getPrivyId();
        if (!privyId) {
          router.push('/');
          return;
        }

        const userData = await getUser(privyId);
        if (!userData) {
          router.push('/');
          return;
        }

        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">プロフィール編集</h1>
        <ProfileEditForm user={user} />
      </div>
    </div>
  );
}
