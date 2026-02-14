'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api/notes';
import { Note, NoteLabel, NoteColor } from '@/types';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  StickyNote,
  Archive,
  Trash2,
  Tag,
  X,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type Tab = 'notes' | 'archive' | 'trash';

export default function NotesPage() {
  const [tab, setTab] = useState<Tab>('notes');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<NoteColor | ''>('');

  const queryClient = useQueryClient();

  const queryParams = {
    archived: tab === 'archive',
    trashed: tab === 'trash',
    search: searchQuery || undefined,
    labelId: selectedLabelId || undefined,
    color: selectedColor || undefined,
    perPage: 100,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notes', queryParams],
    queryFn: async () => {
      const { data } = await notesApi.getAll(queryParams);
      return data.data;
    },
  });

  const { data: labelsData, refetch: refetchLabels } = useQuery({
    queryKey: ['note-labels'],
    queryFn: async () => {
      const { data } = await notesApi.getLabels();
      return data.data || [];
    },
  });

  const labels: NoteLabel[] = labelsData || [];
  const notes = data?.items || [];
  const pinnedNotes = notes.filter((n: Note) => n.isPinned && !n.isArchived && !n.isTrashed);
  const unpinnedNotes = notes.filter((n: Note) => !n.isPinned);

  const invalidateNotes = () => queryClient.invalidateQueries({ queryKey: ['notes'] });

  const pinMutation = useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onSuccess: invalidateNotes,
    onError: () => toast.error('Failed to update note'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => notesApi.toggleArchive(id),
    onSuccess: () => {
      invalidateNotes();
      toast.success(tab === 'archive' ? 'Note unarchived' : 'Note archived');
    },
    onError: () => toast.error('Failed to update note'),
  });

  const trashMutation = useMutation({
    mutationFn: (id: string) => notesApi.moveToTrash(id),
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note moved to trash');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => notesApi.restoreFromTrash(id),
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note restored');
    },
    onError: () => toast.error('Failed to restore note'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note permanently deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleDelete = (id: string) => {
    if (tab === 'trash') {
      if (confirm('Permanently delete this note? This cannot be undone.')) {
        permanentDeleteMutation.mutate(id);
      }
    } else {
      trashMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLabelId('');
    setSelectedColor('');
  };

  const hasFilters = searchQuery || selectedLabelId || selectedColor;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-500">Quick notes, checklists & ideas</p>
        </div>
        <Button
          onClick={() => {
            setSelectedNote(null);
            setShowEditor(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {([
          { key: 'notes', label: 'Notes', icon: StickyNote },
          { key: 'archive', label: 'Archive', icon: Archive },
          { key: 'trash', label: 'Trash', icon: Trash2 },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              clearFilters();
            }}
            className={cn(
              'flex items-center gap-2 pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors',
              tab === t.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search & Filters bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Label filter */}
        {labels.length > 0 && (
          <select
            value={selectedLabelId}
            onChange={(e) => setSelectedLabelId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All labels</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        )}

        {/* Color filter */}
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value as NoteColor | '')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All colors</option>
          {(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'TEAL', 'BLUE', 'PURPLE', 'GRAY'] as NoteColor[]).map(
            (c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            )
          )}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner className="mt-10" size="lg" />
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-lg font-medium">
            {tab === 'trash'
              ? 'Trash is empty'
              : tab === 'archive'
              ? 'No archived notes'
              : hasFilters
              ? 'No notes match your filters'
              : 'No notes yet'}
          </p>
          {tab === 'notes' && !hasFilters && (
            <p className="text-gray-400 text-sm mt-1">
              Click &quot;New Note&quot; to get started
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned notes section */}
          {tab === 'notes' && pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Pinned
              </h3>
              {viewMode === 'grid' ? (
                <NoteGrid
                  notes={pinnedNotes}
                  onEdit={handleEdit}
                  onPin={(id) => pinMutation.mutate(id)}
                  onArchive={(id) => archiveMutation.mutate(id)}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="space-y-2">
                  {pinnedNotes.map((note: Note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEdit}
                      onPin={(id) => pinMutation.mutate(id)}
                      onArchive={(id) => archiveMutation.mutate(id)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Regular / Other notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {tab === 'notes' && pinnedNotes.length > 0 && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Others
                </h3>
              )}
              {viewMode === 'grid' ? (
                <NoteGrid
                  notes={unpinnedNotes}
                  onEdit={handleEdit}
                  onPin={tab === 'notes' ? (id) => pinMutation.mutate(id) : undefined}
                  onArchive={tab !== 'trash' ? (id) => archiveMutation.mutate(id) : undefined}
                  onDelete={handleDelete}
                  onRestore={tab === 'trash' ? (id) => restoreMutation.mutate(id) : undefined}
                />
              ) : (
                <div className="space-y-2">
                  {unpinnedNotes.map((note: Note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEdit}
                      onPin={tab === 'notes' ? (id) => pinMutation.mutate(id) : undefined}
                      onArchive={tab !== 'trash' ? (id) => archiveMutation.mutate(id) : undefined}
                      onDelete={handleDelete}
                      onRestore={tab === 'trash' ? (id) => restoreMutation.mutate(id) : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={selectedNote}
          onSave={invalidateNotes}
          onClose={() => {
            setShowEditor(false);
            setSelectedNote(null);
          }}
          labels={labels}
          onLabelsChange={() => refetchLabels()}
        />
      )}
    </div>
  );
}
