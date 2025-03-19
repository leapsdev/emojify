import Link from 'next/link';

export const NewChatButton = () => {
  return (
    <Link
      href="/choose-friends"
      className="fixed right-4 bottom-20 bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
    >
      <span className="text-2xl">💬</span>
    </Link>
  );
};
