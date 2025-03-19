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

/**
 * タイムスタンプを相対時間に変換
 * @param timestamp UNIXタイムスタンプ
 * @returns 相対時間の文字列（例：3分前、1時間前）
 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return '今';
}
