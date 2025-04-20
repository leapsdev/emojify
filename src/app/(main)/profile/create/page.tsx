import dynamic from 'next/dynamic';

const CreateProfilePage = dynamic(
  () => import('@/components/pages/createProfilePage').then((mod) => mod.CreateProfilePage),
  { ssr: false }
);

export default function Page() {
  return <CreateProfilePage />;
}
