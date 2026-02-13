'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { chatsApi } from '@/lib/api/chats';
import { ChatUser } from '@/types';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { Search, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewChatDialogProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatDialog({ onClose, onChatCreated }: NewChatDialogProps) {
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['chat-users'],
    queryFn: async () => {
      const { data } = await chatsApi.getUsers();
      return data.data || [];
    },
  });

  const users: ChatUser[] = usersData || [];
  const filteredUsers = users.filter(
    (u) =>
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (mode === 'direct' || !selectedUsers.some((s) => s.id === u.id))
  );

  const createDirectMutation = useMutation({
    mutationFn: (participantId: string) => chatsApi.createChat({ participantId }),
    onSuccess: (response) => {
      onChatCreated(response.data.data!.id);
    },
    onError: () => {
      toast.error('Failed to create chat');
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: () =>
      chatsApi.createChat({
        isGroup: true,
        name: groupName.trim(),
        participantIds: selectedUsers.map((u) => u.id),
      }),
    onSuccess: (response) => {
      onChatCreated(response.data.data!.id);
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  const toggleUser = (user: ChatUser) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const canCreateGroup = groupName.trim() && selectedUsers.length >= 2;

  return (
    <Modal isOpen onClose={onClose} title="New Chat">
      <div className="space-y-3">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => { setMode('direct'); setSelectedUsers([]); setSearch(''); }}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              mode === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Direct Message
          </button>
          <button
            onClick={() => { setMode('group'); setSearch(''); }}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              mode === 'group' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            New Group
          </button>
        </div>

        {/* Group name input */}
        {mode === 'group' && (
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={100}
          />
        )}

        {/* Selected users chips (group mode) */}
        {mode === 'group' && selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
              >
                {user.name}
                <button onClick={() => toggleUser(user)} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {/* User list */}
        <div className="max-h-48 overflow-y-auto space-y-1">
          {isLoading ? (
            <LoadingSpinner className="py-6" />
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">No users found</p>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    if (mode === 'direct') {
                      createDirectMutation.mutate(user.id);
                    } else {
                      toggleUser(user);
                    }
                  }}
                  disabled={mode === 'direct' && createDirectMutation.isPending}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                  {mode === 'group' && (
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                    )}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Create group button */}
        {mode === 'group' && (
          <button
            onClick={() => createGroupMutation.mutate()}
            disabled={!canCreateGroup || createGroupMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Users className="w-4 h-4" />
            Create Group ({selectedUsers.length} members)
          </button>
        )}
      </div>
    </Modal>
  );
}
