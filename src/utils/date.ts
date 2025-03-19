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
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'たった今';
  }
  if (minutes < 60) {
    return `${minutes}分前`;
  }
  if (hours < 24) {
    return `${hours}時間前`;
  }
  if (days < 7) {
    return `${days}日前`;
  }
  return formatTimestampToJST(timestamp);
}
