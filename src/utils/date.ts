/**
 * タイムスタンプを日本時間の文字列に変換
 * @param timestamp UNIXタイムスタンプ
 * @returns 日本時間の文字列（例：2025/03/13 12:38）
 */
export function formatTimestampToJST(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 現在のUNIXタイムスタンプを取得
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}
