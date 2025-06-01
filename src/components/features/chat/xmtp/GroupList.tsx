import type { Client } from '@xmtp/browser-sdk';
import { useState } from 'react';
import type { Group } from './types';

type GroupListProps = {
  client: Client | null;
  groups: Group[];
  onCreateGroup: (name: string) => void;
  onSelectGroup: (group: Group) => void;
};

export function GroupList({
  client,
  groups,
  onCreateGroup,
  onSelectGroup,
}: GroupListProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    if (!client || !newGroupName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      onCreateGroup(newGroupName);
      setNewGroupName('');
    } catch (err) {
      console.error('グループの作成に失敗:', err);
      setError(
        err instanceof Error ? err.message : 'グループの作成に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-bold mb-2">グループ一覧</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="新しいグループ名"
            className="w-full p-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || loading}
            className="w-full bg-blue-500 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
          >
            作成
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 text-red-500 bg-red-50 border-b border-red-100 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        {groups.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p className="mb-1 text-sm">グループはありません</p>
            <p className="text-xs">新しいグループを作成してください</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="p-2 bg-white rounded shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150 border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 mb-1 text-sm truncate">
                  {group.name}
                </h3>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">👥</span>
                  <span>{group.members.length}人のメンバー</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
