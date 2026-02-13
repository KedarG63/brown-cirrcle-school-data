'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatsApi } from '@/lib/api/chats';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/lib/hooks/useSocket';
import { ChatListItem, ChatMessage } from '@/types';
import { ChatList } from '@/components/chat/ChatList';
import { ChatConversation } from '@/components/chat/ChatConversation';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { onNewMessage, onGroupUpdated } = useSocket();
  const queryClient = useQueryClient();

  const { data: chatsData, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data } = await chatsApi.getChats();
      return data.data || [];
    },
    refetchInterval: 30000,
  });

  const chats: ChatListItem[] = chatsData || [];

  // Listen for new messages to update chat list in real-time
  useEffect(() => {
    const unsubscribe = onNewMessage((message: ChatMessage) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (message.chatId === selectedChatId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChatId] });
      }
    });
    return unsubscribe;
  }, [onNewMessage, queryClient, selectedChatId]);

  // Listen for group updates (member added/removed)
  useEffect(() => {
    const unsubscribe = onGroupUpdated(() => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });
    return unsubscribe;
  }, [onGroupUpdated, queryClient]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleChatCreated = (chatId: string) => {
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    setSelectedChatId(chatId);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Left panel: Chat list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <ChatList
          chats={chats}
          isLoading={isLoading}
          selectedChatId={selectedChatId}
          currentUserId={user?.id || ''}
          onSelectChat={handleSelectChat}
          onChatCreated={handleChatCreated}
        />
      </div>

      {/* Right panel: Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatConversation
            chatId={selectedChatId}
            currentUserId={user?.id || ''}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Select a chat</p>
              <p className="text-sm">Choose a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
