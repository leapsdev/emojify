import Link from 'next/link';

export const ProfileEditHeader = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Link href="/profile" className="text-2xl">
        👈
      </Link>
    </div>
  );
};
