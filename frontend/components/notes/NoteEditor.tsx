'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note, NoteType, NoteColor, NoteLabel } from '@/types';
import { ColorPicker, noteColorClasses } from './ColorPicker';
import { ChecklistEditor } from './ChecklistEditor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Type, CheckSquare, Tag, Pin } from 'lucide-react';
import { notesApi } from '@/lib/api/notes';
import { toast } from 'sonner';

interface NoteEditorProps {
  note?: Note | null;
  onSave: () => void;
  onClose: () => void;
  labels: NoteLabel[];
  onLabelsChange: () => void;
}

export function NoteEditor({ note, onSave, onClose, labels, onLabelsChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(note?.noteType || 'TEXT');
  const [color, setColor] = useState<NoteColor>(note?.color || 'DEFAULT');
  const [checklistItems, setChecklistItems] = useState<{ text: string; isCompleted: boolean }[]>(
    note?.checklistItems?.map((i) => ({ text: i.text, isCompleted: i.isCompleted })) || []
  );
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    note?.labels?.map((nl) => nl.label.id) || []
  );
  const [showLabels, setShowLabels] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!note?.id;

  const handleSave = async () => {
    if (!title?.trim() && !content?.trim() && checklistItems.length === 0) {
      toast.error('Note cannot be empty');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await notesApi.update(note!.id, {
          title: title || null,
          content: noteType === 'TEXT' ? (content || null) : null,
          noteType,
          color,
        });

        // Sync checklist items for existing notes
        if (noteType === 'CHECKLIST' && note?.id) {
          // Delete removed items
          const existingIds = note.checklistItems?.map((i) => i.id) || [];
          for (const existingItem of note.checklistItems || []) {
            const stillExists = checklistItems.some(
              (i) => i.text === existingItem.text
            );
            if (!stillExists) {
              await notesApi.deleteChecklistItem(note.id, existingItem.id);
            }
          }
          // Update existing & add new items
          for (let i = 0; i < checklistItems.length; i++) {
            const existingItem = note.checklistItems?.find(
              (ei) => ei.text === checklistItems[i].text
            );
            if (existingItem) {
              await notesApi.updateChecklistItem(note.id, existingItem.id, {
                text: checklistItems[i].text,
                isCompleted: checklistItems[i].isCompleted,
                position: i,
              });
            } else {
              await notesApi.addChecklistItem(note.id, {
                text: checklistItems[i].text,
                position: i,
              });
            }
          }
        }

        // Sync labels
        const currentLabelIds = note?.labels?.map((nl) => nl.label.id) || [];
        const toAdd = selectedLabelIds.filter((id) => !currentLabelIds.includes(id));
        const toRemove = currentLabelIds.filter((id) => !selectedLabelIds.includes(id));
        for (const labelId of toAdd) {
          await notesApi.addLabelToNote(note!.id, labelId);
        }
        for (const labelId of toRemove) {
          await notesApi.removeLabelFromNote(note!.id, labelId);
        }

        toast.success('Note updated');
      } else {
        const res = await notesApi.create({
          title: title || undefined,
          content: noteType === 'TEXT' ? (content || undefined) : undefined,
          noteType,
          color,
          checklistItems: noteType === 'CHECKLIST' ? checklistItems.map((item, i) => ({
            text: item.text,
            isCompleted: item.isCompleted,
            position: i,
          })) : undefined,
        });

        // Add labels to new note
        if (res.data.data && selectedLabelIds.length > 0) {
          for (const labelId of selectedLabelIds) {
            await notesApi.addLabelToNote(res.data.data.id, labelId);
          }
        }

        toast.success('Note created');
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const res = await notesApi.createLabel({ name: newLabelName.trim() });
      if (res.data.data) {
        setSelectedLabelIds([...selectedLabelIds, res.data.data.id]);
        onLabelsChange();
      }
      setNewLabelName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create label');
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'relative z-50 w-full max-w-2xl rounded-t-xl sm:rounded-xl shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] sm:mx-4',
          noteColorClasses[color]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNoteType('TEXT')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                noteType === 'TEXT'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <Type className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setNoteType('CHECKLIST')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                noteType === 'CHECKLIST'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <CheckSquare className="w-4 h-4" />
              Checklist
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-gray-200/70 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-lg font-semibold border-none outline-none mb-3 bg-transparent placeholder:text-gray-400"
          />

          {noteType === 'TEXT' && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full min-h-[120px] sm:min-h-[180px] border-none outline-none resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
            />
          )}

          {noteType === 'CHECKLIST' && (
            <ChecklistEditor items={checklistItems} onChange={setChecklistItems} />
          )}
        </div>

        {/* Labels section */}
        {showLabels && (
          <div className="px-4 pb-3 border-t border-gray-200/50 pt-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    selectedLabelIds.includes(label.id)
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {label.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                placeholder="New label..."
                className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded bg-transparent"
              />
              <Button size="sm" onClick={handleCreateLabel} disabled={!newLabelName.trim()}>
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ColorPicker selected={color} onChange={setColor} />
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showLabels ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200/70 text-gray-500'
              )}
              title="Labels"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
