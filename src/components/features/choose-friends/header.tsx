import Link from "next/link"

export function Header() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Link href="/chat" className="text-2xl">
        👈
      </Link>
      <span className="text-2xl">👫</span>
      <button className="text-2xl">👉</button>
    </div>
  )
}
