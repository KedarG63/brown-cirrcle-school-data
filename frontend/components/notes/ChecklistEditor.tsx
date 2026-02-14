'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Plus, X } from 'lucide-react';

interface ChecklistEditorProps {
  items: { text: string; isCompleted: boolean }[];
  onChange: (items: { text: string; isCompleted: boolean }[]) => void;
  disabled?: boolean;
}

export interface ChecklistEditorRef {
  getPendingText: () => string;
  clearPendingText: () => void;
}

export const ChecklistEditor = forwardRef<ChecklistEditorRef, ChecklistEditorProps>(
  function ChecklistEditor({ items, onChange, disabled }, ref) {
    const [newItemText, setNewItemText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingRef = useRef('');

    // Keep ref in sync with state
    pendingRef.current = newItemText;

    useImperativeHandle(ref, () => ({
      getPendingText: () => pendingRef.current,
      clearPendingText: () => setNewItemText(''),
    }));

    const addItem = () => {
      if (!newItemText.trim()) return;
      onChange([...items, { text: newItemText.trim(), isCompleted: false }]);
      setNewItemText('');
      inputRef.current?.focus();
    };

    const toggleItem = (index: number) => {
      const updated = [...items];
      updated[index] = { ...updated[index], isCompleted: !updated[index].isCompleted };
      onChange(updated);
    };

    const updateItemText = (index: number, text: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], text };
      onChange(updated);
    };

    const removeItem = (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
      }
    };

    const unchecked = items.filter((item) => !item.isCompleted);
    const checked = items.filter((item) => item.isCompleted);

    return (
      <div className="space-y-1">
        {/* Unchecked items */}
        {unchecked.map((item) => {
          const realIndex = items.indexOf(item);
          return (
            <div key={realIndex} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleItem(realIndex)}
                disabled={disabled}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItemText(realIndex, e.target.value)}
                disabled={disabled}
                className="flex-1 bg-transparent border-none outline-none text-sm py-1"
              />
              {!disabled && (
                <button
                  onClick={() => removeItem(realIndex)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add new item */}
        {!disabled && (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add item..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-1 placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Checked items */}
        {checked.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">
              {checked.length} completed {checked.length === 1 ? 'item' : 'items'}
            </p>
            {checked.map((item) => {
              const realIndex = items.indexOf(item);
              return (
                <div key={realIndex} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleItem(realIndex)}
                    disabled={disabled}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="flex-1 text-sm text-gray-400 line-through py-1">{item.text}</span>
                  {!disabled && (
                    <button
                      onClick={() => removeItem(realIndex)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
