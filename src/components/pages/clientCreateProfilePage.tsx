'use client';

import dynamic from 'next/dynamic';

const CreateProfilePage = dynamic(
  () => import('@/components/pages/createProfilePage').then((mod) => mod.CreateProfilePage),
  { ssr: false }
);

export function ClientCreateProfilePage() {
  return <CreateProfilePage />;
} 