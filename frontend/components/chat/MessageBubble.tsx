import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FilePreview } from './FilePreview';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender?: boolean;
}

export function MessageBubble({ message, isOwn, showSender }: MessageBubbleProps) {
  const hasFile = message.messageType !== 'TEXT' && message.fileUrl;

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 my-0.5',
          isOwn
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
        )}
      >
        {showSender && !isOwn && (
          <p className="text-xs font-semibold text-primary-600 mb-1">
            {message.sender.name}
          </p>
        )}

        {hasFile && (
          <div className="mb-1">
            <FilePreview
              messageType={message.messageType as 'IMAGE' | 'FILE'}
              fileUrl={message.fileUrl!}
              fileName={message.fileName}
              fileSize={message.fileSize}
              isOwn={isOwn}
            />
          </div>
        )}

        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        <p
          className={cn(
            'text-[10px] mt-1 text-right',
            isOwn ? 'text-primary-200' : 'text-gray-400'
          )}
        >
          {format(new Date(message.createdAt), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
