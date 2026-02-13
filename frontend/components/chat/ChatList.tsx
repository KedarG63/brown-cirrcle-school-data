'use client';

import { useState } from 'react';
import { ChatListItem } from '@/types';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NewChatDialog } from './NewChatDialog';
import { MessageSquarePlus, Search, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  chats: ChatListItem[];
  isLoading: boolean;
  selectedChatId: string | null;
  currentUserId: string;
  onSelectChat: (chatId: string) => void;
  onChatCreated: (chatId: string) => void;
}

function getLastMessagePreview(chat: ChatListItem, currentUserId: string): string {
  if (!chat.lastMessage) return 'No messages yet';

  let prefix = '';
  if (chat.isGroup && chat.lastMessage.senderId === currentUserId) {
    prefix = 'You: ';
  } else if (chat.isGroup) {
    prefix = `${chat.lastMessage.senderName}: `;
  } else if (chat.lastMessage.senderId === currentUserId) {
    prefix = 'You: ';
  }

  let content = chat.lastMessage.content || '';
  if (chat.lastMessage.messageType === 'IMAGE') {
    content = 'Photo';
  } else if (chat.lastMessage.messageType === 'FILE') {
    content = 'File';
  }

  return `${prefix}${content}`;
}

export function ChatList({
  chats,
  isLoading,
  selectedChatId,
  currentUserId,
  onSelectChat,
  onChatCreated,
}: ChatListProps) {
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter((chat) => {
    const searchTarget = chat.isGroup ? chat.name : chat.otherUser?.name;
    return searchTarget?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="New chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingSpinner className="mt-10" />
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {chats.length === 0 ? 'No chats yet' : 'No results'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const displayName = chat.isGroup ? (chat.name || 'Group') : (chat.otherUser?.name || 'Unknown');
            const avatarLetter = displayName.charAt(0).toUpperCase();

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  'w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left',
                  selectedChatId === chat.id && 'bg-primary-50 hover:bg-primary-50'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  chat.isGroup ? 'bg-emerald-100' : 'bg-primary-100'
                )}>
                  {chat.isGroup ? (
                    <Users className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <span className="text-sm font-semibold text-primary-700">
                      {avatarLetter}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm truncate',
                      chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'
                    )}>
                      {displayName}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={cn(
                      'text-xs truncate',
                      chat.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                    )}>
                      {getLastMessagePreview(chat, currentUserId)}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-medium">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* New Chat Dialog */}
      {showNewChat && (
        <NewChatDialog
          onClose={() => setShowNewChat(false)}
          onChatCreated={(chatId) => {
            setShowNewChat(false);
            onChatCreated(chatId);
          }}
        />
      )}
    </>
  );
}
