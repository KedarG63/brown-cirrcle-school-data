'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { chatsApi } from '@/lib/api/chats';
import { MessageType } from '@/types';
import { toast } from 'sonner';

interface MessageInputProps {
  chatId: string;
  onSend: (data: {
    content?: string;
    messageType?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) => void;
}

export function MessageInput({ chatId, onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    messageType: MessageType;
    previewUrl?: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;

    if (pendingFile) {
      onSend({
        content: trimmed || undefined,
        messageType: pendingFile.messageType,
        fileUrl: pendingFile.fileUrl,
        fileName: pendingFile.fileName,
        fileSize: pendingFile.fileSize,
      });
    } else {
      onSend({ content: trimmed });
    }

    setText('');
    setPendingFile(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    setUploading(true);
    try {
      const { data } = await chatsApi.uploadFile(chatId, file);
      if (data.data) {
        const isImage = file.type.startsWith('image/');
        setPendingFile({
          fileUrl: data.data.fileUrl,
          fileName: data.data.fileName,
          fileSize: data.data.fileSize,
          messageType: data.data.messageType,
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        });
      }
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  };

  const canSend = !uploading && (text.trim() || pendingFile);

  return (
    <div className="border-t border-gray-200 bg-white">
      {(pendingFile || uploading) && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </>
            ) : pendingFile && (
              <>
                {pendingFile.previewUrl ? (
                  <img src={pendingFile.previewUrl} alt="" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <span className="text-sm text-gray-700 truncate flex-1">{pendingFile.fileName}</span>
                <button onClick={clearFile} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingFile ? 'Add a caption...' : 'Type a message...'}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
