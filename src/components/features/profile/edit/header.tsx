import Link from 'next/link';

export const ProfileEditHeader = () => {
  return (
    <div className="relative flex items-center justify-center p-4 border-b">
      <Link href="/profile" className="text-2xl absolute left-4">
        👈
      </Link>
      <h1 className="text-xl font-semibold">プロフィール編集</h1>
    </div>
  );
};
