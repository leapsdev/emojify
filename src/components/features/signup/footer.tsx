import { FC } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const Footer: FC = () => {
  return (
    <div className="space-y-6">
      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-xl font-black">
        Get started
      </Button>

      <div className="flex justify-center items-center gap-4 text-gray-500">
        <Link href="#" className="hover:text-gray-600 font-bold">
          Help Center
        </Link>
        <span>•</span>
        <Link href="#" className="hover:text-gray-600 font-bold">
          X
        </Link>
        <span>•</span>
        <Link href="#" className="hover:text-gray-600 font-bold">
          Instagram
        </Link>
        <span>•</span>
        <Link href="#" className="hover:text-gray-600 font-bold">
          Farcaster
        </Link>
      </div>
    </div>
  )
}

export default Footer
