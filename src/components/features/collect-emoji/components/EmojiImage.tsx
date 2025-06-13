import Image from 'next/image';

interface Props {
  image: string;
}

export function EmojiImage({ image }: Props) {
  return (
    <div className="flex items-center justify-center px-4 pt-4 pb-3">
      <Image
        src={image || '/placeholder.svg'}
        alt="Emoji Art"
        width={400}
        height={600}
        className="max-w-full max-h-[55vh] object-contain rounded-md"
        unoptimized={image?.endsWith('.gif')}
      />
    </div>
  );
}
