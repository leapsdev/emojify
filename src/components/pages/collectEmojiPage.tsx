import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Image from 'next/image';


const EMOJI_DATA = {
  id: "1",
  image: "/placeholder.svg?height=600&width=400&text=🎨",
  creator: {
    id: "kitasavi",
    username: "kitaisaivi15",
    avatar: "/placeholder.svg?height=40&width=40",
    timeAgo: "2d",
  },
  details: {
    firstCollector: "Jesse.eth",
    firstCollectorAvatar: "/placeholder.svg?height=32&width=32",
    token: "ERC-1155",
    network: "Base",
  },
}

export function CollectEmojiPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col font-nunito">

      {/* メイン画像 */}
      <div className="flex items-center justify-center px-4 pt-4 pb-3">
        <Image
          src={EMOJI_DATA.image || "/placeholder.svg"}
          alt="Emoji Art"
          width={400}
          height={600}
          className="max-w-full max-h-[55vh] object-contain rounded-md"
        />
      </div>

      {/* クリエイター情報 */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Image
              src={EMOJI_DATA.creator.avatar || "/placeholder.svg"}
              alt={EMOJI_DATA.creator.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="font-semibold">{EMOJI_DATA.creator.id}</p>
          </div>
          <p className="text-gray-400 text-sm">{EMOJI_DATA.creator.timeAgo}</p>
        </div>

        {/* ユーザー名 */}
        <h1 className="text-4xl font-bold mb-6">{EMOJI_DATA.creator.username}</h1>

        {/* 詳細情報 */}
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">Detail</h2>

          <div>
            {/* First Collector */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-gray-700 text-lg">First Collector</span>
              <div className="flex items-center gap-2">
                <Image
                  src={EMOJI_DATA.details.firstCollectorAvatar || "/placeholder.svg"}
                  alt="First Collector"
                  width={32}
                  height={32}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{EMOJI_DATA.details.firstCollector}</span>
              </div>
            </div>

            {/* Token (旧Network) */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-gray-700 text-lg">Token</span>
              <span className="font-medium">{EMOJI_DATA.details.token}</span>
            </div>

            {/* Network (旧Chain) */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-gray-700 text-lg">Network</span>
              <span className="font-medium">{EMOJI_DATA.details.network}</span>
            </div>
          </div>
        </div>

        {/* Collectボタン - 詳細情報の下に移動 */}
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-bold mt-8">
          <Plus className="w-5 h-5 mr-2" />
          Collect
        </Button>
      </div>
    </main>
  );
}
