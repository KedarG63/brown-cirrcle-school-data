'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatsApi } from '@/lib/api/chats';
import { ChatUser } from '@/types';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { UserPlus, X, Shield, Search } from 'lucide-react';

interface GroupInfoPanelProps {
  chatId: string;
  currentUserId: string;
  onClose: () => void;
}

export function GroupInfoPanel({ chatId, currentUserId, onClose }: GroupInfoPanelProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: groupData, isLoading } = useQuery({
    queryKey: ['group-details', chatId],
    queryFn: async () => {
      const { data } = await chatsApi.getGroupDetails(chatId);
      return data.data;
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ['chat-users'],
    queryFn: async () => {
      const { data } = await chatsApi.getUsers();
      return data.data || [];
    },
    enabled: showAddMember,
  });

  const addMutation = useMutation({
    mutationFn: (userId: string) => chatsApi.addParticipant(chatId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Member added');
      setShowAddMember(false);
      setAddSearch('');
    },
    onError: () => toast.error('Failed to add member'),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => chatsApi.removeParticipant(chatId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const isAdmin = groupData?.participants.some(
    (p) => p.id === currentUserId && p.participantRole === 'ADMIN'
  );

  const existingIds = new Set(groupData?.participants.map((p) => p.id) || []);
  const availableUsers = (allUsers || []).filter(
    (u: ChatUser) =>
      !existingIds.has(u.id) &&
      (u.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(addSearch.toLowerCase()))
  );

  return (
    <Modal isOpen onClose={onClose} title="Group Info">
      {isLoading ? (
        <LoadingSpinner className="py-6" />
      ) : !groupData ? (
        <p className="text-sm text-gray-400 text-center py-6">Group not found</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Group Name</p>
            <p className="text-sm font-semibold text-gray-900">{groupData.name}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Members ({groupData.participants.length})
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No users available</p>
                  ) : (
                    availableUsers.map((user: ChatUser) => (
                      <button
                        key={user.id}
                        onClick={() => addMutation.mutate(user.id)}
                        disabled={addMutation.isPending}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {groupData.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      {p.participantRole === 'ADMIN' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{p.email}</p>
                  </div>
                  {isAdmin && p.id !== groupData.createdById && p.id !== currentUserId && (
                    <button
                      onClick={() => removeMutation.mutate(p.id)}
                      disabled={removeMutation.isPending}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove member"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
