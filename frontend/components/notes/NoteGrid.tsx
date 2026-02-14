'use client';

import { Note } from '@/types';
import { NoteCard } from './NoteCard';

interface NoteGridProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function NoteGrid({ notes, onEdit, onPin, onArchive, onDelete, onRestore }: NoteGridProps) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onPin={onPin}
          onArchive={onArchive}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
