'use client';

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"

export const LoginButton = () => {
  const { login, ready, authenticated } = usePrivy()

  if (!ready || authenticated) return null

  return (
    <Button
      onClick={login}
      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
    >
      ログイン
    </Button>
  )
}
