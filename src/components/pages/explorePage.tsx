import Image from 'next/image';
import Link from 'next/link';

const GALLERY_ITEMS = [
  {
    id: '1',
    image: '/placeholder.svg?height=300&width=300&text=🌸',
    creator: {
      id: 'creator1',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
  {
    id: '2',
    image: '/placeholder.svg?height=300&width=300&text=🎨',
    creator: {
      id: 'creator2',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
  {
    id: '3',
    image: '/placeholder.svg?height=300&width=300&text=🏠',
    creator: {
      id: 'creator3',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
  {
    id: '4',
    image: '/placeholder.svg?height=300&width=300&text=🎭',
    creator: {
      id: 'creator4',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
  {
    id: '5',
    image: '/placeholder.svg?height=300&width=300&text=🦈',
    creator: {
      id: 'creator5',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
  {
    id: '6',
    image: '/placeholder.svg?height=300&width=300&text=🌈',
    creator: {
      id: 'creator6',
      avatar: '/placeholder.svg?height=24&width=24',
    },
  },
];

export function ExplorePage() {
  return (
    <main>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {GALLERY_ITEMS.map((item, index) => (
            <Link
              key={item.id}
              href={
                index % 2 === 0
                  ? `/emoji-mint/${item.id}`
                  : `/emoji-mint-v2/${item.id}`
              }
              className="block"
            >
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                <Image
                  src={item.image || '/placeholder.svg'}
                  alt=""
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
                {/* クリエイターアイコン */}
                <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={item.creator.avatar || '/placeholder.svg'}
                    alt="Creator"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
