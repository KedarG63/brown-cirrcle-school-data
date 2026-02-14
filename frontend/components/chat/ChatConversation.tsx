'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatsApi } from '@/lib/api/chats';
import { useSocket } from '@/lib/hooks/useSocket';
import { ChatMessage, ChatListItem, MessageType } from '@/types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { GroupInfoPanel } from './GroupInfoPanel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Users, ArrowLeft } from 'lucide-react';

interface ChatConversationProps {
  chatId: string;
  currentUserId: string;
  onBack?: () => void;
}

export function ChatConversation({ chatId, currentUserId, onBack }: ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { sendMessage, joinChat, onNewMessage } = useSocket();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const { data } = await chatsApi.getMessages(chatId, { perPage: 100 });
      return data.data;
    },
  });

  const messages: ChatMessage[] = data?.items || [];

  // Get chat info from cached list
  const chats = queryClient.getQueryData<ChatListItem[]>(['chats']);
  const currentChat = chats?.find((c) => c.id === chatId);
  const isGroup = currentChat?.isGroup || false;

  const chatDisplayName = (() => {
    if (isGroup) return currentChat?.name || 'Group';
    const otherMsg = messages.find((m) => m.senderId !== currentUserId);
    if (otherMsg) return otherMsg.sender.name;
    return currentChat?.otherUser?.name || 'Chat';
  })();

  // Mark as read when opening this chat
  useEffect(() => {
    joinChat(chatId);
    chatsApi.markAsRead(chatId);
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  }, [chatId, joinChat, queryClient]);

  // Listen for new messages in this chat
  useEffect(() => {
    const unsubscribe = onNewMessage((message: ChatMessage) => {
      if (message.chatId === chatId) {
        queryClient.setQueryData(
          ['chat-messages', chatId],
          (old: { items: ChatMessage[]; pagination: any } | undefined) => {
            if (!old) return old;
            const exists = old.items.some((m) => m.id === message.id);
            if (exists) return old;
            return { ...old, items: [...old.items, message] };
          }
        );
        // Mark as read since we're viewing this chat
        chatsApi.markAsRead(chatId);
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    });
    return unsubscribe;
  }, [chatId, onNewMessage, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (data: {
    content?: string;
    messageType?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) => {
    sendMessage(chatId, data);
  };

  return (
    <>
      {/* Chat header */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-200 flex items-center gap-2 sm:gap-3 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          {isGroup ? (
            <Users className="w-4 h-4 text-primary-700" />
          ) : (
            <span className="text-sm font-semibold text-primary-700">
              {chatDisplayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{chatDisplayName}</h3>
          {isGroup && currentChat?.participants && (
            <p className="text-xs text-gray-500 truncate">
              {currentChat.participants.map((p) => p.name).join(', ')}
            </p>
          )}
        </div>
        {isGroup && (
          <button
            onClick={() => setShowGroupInfo(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Group info"
          >
            <Users className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50">
        {isLoading ? (
          <LoadingSpinner className="mt-10" />
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showSender={isGroup}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput chatId={chatId} onSend={handleSend} />

      {/* Group info panel */}
      {showGroupInfo && (
        <GroupInfoPanel
          chatId={chatId}
          currentUserId={currentUserId}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </>
  );
}
