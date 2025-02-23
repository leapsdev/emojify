import Link from "next/link"

export function Header() {
  return (
    <div className="flex items-center p-4 border-b">
      <Link href="/" className="text-black text-2xl font-medium">
        ＜
      </Link>
      <div className="flex-1 mr-6" />
    </div>
  )
}
