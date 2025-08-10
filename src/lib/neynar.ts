import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Neynar APIクライアントの初期化
const client = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

/**
 * Farcaster ユーザープロファイル取得
 * @param fid Farcaster ID
 * @returns ユーザープロファイル情報
 */
export async function getFarcasterUserProfile(fid: number) {
  try {
    const user = await client.fetchBulkUsers({ fids: [fid] });
    return user.users[0] || null;
  } catch (error) {
    console.error('Error fetching Farcaster user profile:', error);
    throw error;
  }
}

/**
 * FIDからユーザー情報を取得（複数）
 * @param fids Farcaster IDの配列
 * @returns ユーザー情報の配列
 */
export async function getFarcasterUsers(fids: number[]) {
  try {
    const users = await client.fetchBulkUsers({ fids });
    return users.users;
  } catch (error) {
    console.error('Error fetching Farcaster users:', error);
    throw error;
  }
}

/**
 * ユーザー名からユーザー検索
 * @param username ユーザー名
 * @returns 検索結果
 */
export async function searchFarcasterUsers(username: string) {
  try {
    const result = await client.searchUser({
      q: username,
      limit: 10,
    });
    return result.result.users;
  } catch (error) {
    console.error('Error searching Farcaster users:', error);
    throw error;
  }
}

export { client as neynarClient };