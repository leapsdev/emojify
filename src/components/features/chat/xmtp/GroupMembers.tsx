import type { Identifier, IdentifierKind } from '@xmtp/browser-sdk';
import { useState } from 'react';
import { isAddress } from 'viem';
import type { Group, GroupMember, XMTPClient } from './types';

type GroupMembersProps = {
  client: XMTPClient | null;
  group: Group | null;
  onUpdateGroup: (group: Group) => void;
  onClose: () => void;
};

export function GroupMembers({
  client,
  group,
  onUpdateGroup,
  onClose,
}: GroupMembersProps) {
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = async () => {
    if (!client || !group || !isAddress(newMemberAddress)) return;

    try {
      setLoading(true);
      setError(null);

      console.log('メンバー追加処理開始:', {
        newMemberAddress,
        clientAddress: client.address,
      });

      // メンバーが既に存在するか確認
      if (
        group.members.some(
          (member) =>
            member.address.toLowerCase() === newMemberAddress.toLowerCase(),
        )
      ) {
        throw new Error('このアドレスは既にメンバーとして追加されています');
      }

      // XMTP初期化状態を確認 - 正しいIdentifier構造を使用
      console.log('XMTP初期化状態を確認中:', newMemberAddress);

      // アドレスの形式を正規化（0xプリフィックスを確保）
      const normalizedAddress = newMemberAddress.startsWith('0x')
        ? newMemberAddress.toLowerCase()
        : `0x${newMemberAddress.toLowerCase()}`;

      console.log('Normalized member address:', normalizedAddress);

      const memberIdentifier: Identifier = {
        identifier: normalizedAddress,
        identifierKind: 'Ethereum' as IdentifierKind,
      };

      let isOnXMTP = false;
      try {
        const canMessageMap = await client.canMessage([memberIdentifier]);
        isOnXMTP = canMessageMap.get(memberIdentifier.identifier) || false;
        console.log('XMTP初期化状態の結果:', {
          address: normalizedAddress,
          isOnXMTP,
        });
      } catch (canMessageError) {
        console.warn(
          'XMTP状態確認に失敗（メンバーは追加されますが、XMTP状態は不明）:',
          canMessageError,
        );
        // canMessage が失敗してもメンバー追加は続行する
        isOnXMTP = false;
      }

      // メンバーを追加
      const newMember: GroupMember = {
        address: normalizedAddress,
        isOnXMTP,
      };

      console.log('新しいメンバー情報:', newMember);

      const updatedGroup = {
        ...group,
        members: [...group.members, newMember],
      };

      console.log('更新後のグループ情報:', {
        groupId: updatedGroup.id,
        memberCount: updatedGroup.members.length,
        members: updatedGroup.members,
      });

      onUpdateGroup(updatedGroup);
      setNewMemberAddress('');
    } catch (err) {
      console.error('メンバーの追加に失敗:', err);
      setError(
        err instanceof Error ? err.message : 'メンバーの追加に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (address: string) => {
    if (!group) return;

    // 自分自身は削除できない
    if (address.toLowerCase() === client?.address.toLowerCase()) {
      setError('自分自身をグループから削除することはできません');
      return;
    }

    const updatedGroup = {
      ...group,
      members: group.members.filter(
        (member) => member.address !== address.toLowerCase(),
      ),
    };

    onUpdateGroup(updatedGroup);
  };

  if (!group) {
    return (
      <div className="text-center text-gray-500">
        グループを選択してください
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{group.name} - メンバー管理</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMemberAddress}
            onChange={(e) => setNewMemberAddress(e.target.value)}
            placeholder="メンバーのウォレットアドレス"
            className={`flex-1 p-2 border rounded ${
              newMemberAddress && !isAddress(newMemberAddress)
                ? 'border-red-500'
                : ''
            }`}
          />
          <button
            type="button"
            onClick={handleAddMember}
            disabled={!isAddress(newMemberAddress) || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            追加
          </button>
        </div>
        {newMemberAddress && !isAddress(newMemberAddress) && (
          <p className="text-red-500 text-sm mt-1">
            有効なイーサリアムアドレスを入力してください
          </p>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {group.members.map((member) => (
            <div
              key={member.address}
              className="flex items-center justify-between p-3 bg-white rounded shadow"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm truncate max-w-[200px]">
                  {member.address === client?.address
                    ? `${member.address} (自分)`
                    : member.address}
                </span>
                {!member.isOnXMTP && (
                  <span className="text-yellow-600 text-xs">未参加</span>
                )}
              </div>
              {member.address !== client?.address && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.address)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
