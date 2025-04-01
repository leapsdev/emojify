import Image from 'next/image';

interface CreatorAvatarProps {
  avatarUrl: string;
}

export function CreatorAvatar({ avatarUrl }: CreatorAvatarProps) {
  return (
    <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white">
      <Image
        src={avatarUrl || '/placeholder.svg'}
        alt="Creator"
        width={24}
        height={24}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
