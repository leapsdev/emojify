import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 現在のタイムスタンプを取得
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

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
 * 日付を相対的な時間表示にフォーマット（例：今、5分前、昨日）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  // 同じ年かどうかをチェック
  if (now.getFullYear() !== date.getFullYear()) {
    return formatDateToYYYYMMDD(timestamp);
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return 'yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return formatDateToYYYYMMDD(timestamp);
}
