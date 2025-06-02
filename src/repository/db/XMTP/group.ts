import type { Client, Group } from '@xmtp/browser-sdk';

// グループ作成
export async function createGroup(
  client: Client,
  name: string,
  members: string[],
): Promise<Group<string>> {
  try {
    const group = await client.conversations.newGroup(members, { name });
    return group as Group<string>;
  } catch (error) {
    console.error('グループの作成に失敗しました:', error);
    throw error;
  }
}

// メンバー追加
export async function addMember(
  group: Group<string>,
  address: string,
): Promise<void> {
  try {
    await group.addMembers([address]);
  } catch (error) {
    console.error('メンバーの追加に失敗しました:', error);
    throw error;
  }
}

// メンバー削除
export async function removeMember(
  group: Group<string>,
  address: string,
): Promise<void> {
  try {
    await group.removeMembers([address]);
  } catch (error) {
    console.error('メンバーの削除に失敗しました:', error);
    throw error;
  }
}
