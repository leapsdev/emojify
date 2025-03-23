/**
 * 日付を YYYY/MM/DD 形式にフォーマット
 */
export function formatDateToYYYYMMDD(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 日付を相対表示にフォーマット（例：今日、昨日、3日前）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  
  // 同じ年かどうかをチェック
  if (now.getFullYear() !== date.getFullYear()) {
    return formatDateToYYYYMMDD(timestamp);
  }

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  }

  // 1週間以上前は日付を表示
  return formatDateToYYYYMMDD(timestamp);
}
