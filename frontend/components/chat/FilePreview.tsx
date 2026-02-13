'use client';

import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  messageType: 'IMAGE' | 'FILE';
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  isOwn: boolean;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ messageType, fileUrl, fileName, fileSize, isOwn }: FilePreviewProps) {
  if (messageType === 'IMAGE') {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={fileUrl}
          alt={fileName || 'Image'}
          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={fileUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg min-w-[200px] transition-colors',
        isOwn
          ? 'bg-primary-700/30 hover:bg-primary-700/40'
          : 'bg-gray-100 hover:bg-gray-200'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        isOwn ? 'bg-primary-700/40' : 'bg-gray-200'
      )}>
        <FileText className={cn('w-5 h-5', isOwn ? 'text-white' : 'text-gray-600')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isOwn ? 'text-white' : 'text-gray-900'
        )}>
          {fileName || 'File'}
        </p>
        {fileSize && (
          <p className={cn('text-xs', isOwn ? 'text-primary-200' : 'text-gray-500')}>
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <Download className={cn('w-4 h-4 flex-shrink-0', isOwn ? 'text-primary-200' : 'text-gray-400')} />
    </a>
  );
}
