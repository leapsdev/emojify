'use server'

import webpush, { PushSubscription as WebPushSubscription } from 'web-push'

webpush.setVapidDetails(
  'mailto:notifications@emoji-chat.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

let subscription: WebPushSubscription | null = null

export async function subscribeUser(sub: unknown) {
  // PushSubscriptionをWebPushSubscriptionに変換
  const webPushSub = sub as WebPushSubscription
  subscription = webPushSub
  // 本番環境では、データベースにサブスクリプションを保存する必要があります
  // 例: await db.subscriptions.create({ data: sub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // 本番環境では、データベースからサブスクリプションを削除する必要があります
  // 例: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('サブスクリプションがありません')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Emoji Chat',
        body: message,
        icon: '/icons/icon-192x192.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('プッシュ通知の送信エラー:', error)
    return { success: false, error: '通知の送信に失敗しました' }
  }
}
