/* eslint-disable @next/next/no-img-element */
interface Props {
  image: string;
}

export function EmojiImage({ image }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-80 h-80 overflow-hidden rounded-md bg-gray-50">
        <img
          src={image || '/placeholder.svg'}
          alt="Emoji Art"
          className="w-full h-full object-fill"
        />
      </div>
    </div>
  );
}
