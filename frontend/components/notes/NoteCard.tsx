'use client';

import { Note, NoteColor } from '@/types';
import { cn } from '@/lib/utils';
import { noteColorClasses } from './ColorPicker';
import { Pin, Archive, Trash2, ArchiveRestore, RotateCcw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function NoteCard({ note, onEdit, onPin, onArchive, onDelete, onRestore }: NoteCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all group relative',
        noteColorClasses[note.color]
      )}
      onClick={() => onEdit(note)}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-3.5 h-3.5 text-gray-500 fill-current" />
        </div>
      )}

      {/* Title */}
      {note.title && (
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 pr-5">{note.title}</h3>
      )}

      {/* Text content preview */}
      {note.noteType === 'TEXT' && note.content && (
        <p className="text-xs text-gray-600 line-clamp-4 mb-2 whitespace-pre-line">{note.content}</p>
      )}

      {/* Checklist preview */}
      {note.noteType === 'CHECKLIST' && note.checklistItems && note.checklistItems.length > 0 && (
        <div className="space-y-0.5 mb-2">
          {note.checklistItems.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center',
                  item.isCompleted ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                )}
              >
                {item.isCompleted && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={cn('text-xs truncate', item.isCompleted && 'line-through text-gray-400')}>
                {item.text}
              </span>
            </div>
          ))}
          {note.checklistItems.length > 4 && (
            <p className="text-xs text-gray-400 pl-5">+{note.checklistItems.length - 4} more</p>
          )}
        </div>
      )}

      {/* Labels */}
      {note.labels && note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.labels.map((nl) => (
            <span
              key={nl.label.id}
              className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-200/70 text-gray-600 font-medium"
            >
              {nl.label.name}
            </span>
          ))}
        </div>
      )}

      {/* School association */}
      {note.school && (
        <p className="text-[10px] text-gray-400 mb-1.5 truncate">
          {note.school.name}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
        <span className="text-[10px] text-gray-400">{formatDate(note.updatedAt)}</span>

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {note.isTrashed ? (
            <>
              {onRestore && (
                <button onClick={() => onRestore(note.id)} className="p-1 hover:bg-gray-200/70 rounded" title="Restore">
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(note.id)} className="p-1 hover:bg-red-100 rounded" title="Delete permanently">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </>
          ) : (
            <>
              {onPin && (
                <button onClick={() => onPin(note.id)} className="p-1 hover:bg-gray-200/70 rounded" title={note.isPinned ? 'Unpin' : 'Pin'}>
                  <Pin className={cn('w-3.5 h-3.5', note.isPinned ? 'text-primary-600 fill-current' : 'text-gray-500')} />
                </button>
              )}
              {onArchive && (
                <button onClick={() => onArchive(note.id)} className="p-1 hover:bg-gray-200/70 rounded" title={note.isArchived ? 'Unarchive' : 'Archive'}>
                  {note.isArchived ? (
                    <ArchiveRestore className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <Archive className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(note.id)} className="p-1 hover:bg-red-100 rounded" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
