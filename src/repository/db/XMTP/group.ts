import type { Client, Group } from '@xmtp/browser-sdk';

// グループ作成
export async function createGroup(
  client: Client,
  name: string,
  members: string[],
) {
  try {
    const group = await client.conversations.newGroup(members, { name });
    return group;
  } catch (error) {
    console.error('グループの作成に失敗しました:', error);
    throw error;
  }
}

// メンバー追加
export async function addMember(group: Group, memberAddress: string) {
  try {
    await group.addMembers([memberAddress]);
  } catch (error) {
    console.error('メンバーの追加に失敗しました:', error);
    throw error;
  }
}

// メンバー削除
export async function removeMember(group: Group, memberAddress: string) {
  try {
    await group.removeMembers([memberAddress]);
  } catch (error) {
    console.error('メンバーの削除に失敗しました:', error);
    throw error;
  }
}
