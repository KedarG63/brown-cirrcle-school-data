'use client';

import { NoteColor } from '@/types';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  selected: NoteColor;
  onChange: (color: NoteColor) => void;
  className?: string;
}

const colors: { value: NoteColor; bg: string; ring: string }[] = [
  { value: 'DEFAULT', bg: 'bg-white border-gray-300', ring: 'ring-gray-400' },
  { value: 'RED', bg: 'bg-red-200', ring: 'ring-red-400' },
  { value: 'ORANGE', bg: 'bg-orange-200', ring: 'ring-orange-400' },
  { value: 'YELLOW', bg: 'bg-yellow-200', ring: 'ring-yellow-400' },
  { value: 'GREEN', bg: 'bg-green-200', ring: 'ring-green-400' },
  { value: 'TEAL', bg: 'bg-teal-200', ring: 'ring-teal-400' },
  { value: 'BLUE', bg: 'bg-blue-200', ring: 'ring-blue-400' },
  { value: 'PURPLE', bg: 'bg-purple-200', ring: 'ring-purple-400' },
  { value: 'GRAY', bg: 'bg-gray-300', ring: 'ring-gray-500' },
];

export function ColorPicker({ selected, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={cn(
            'w-7 h-7 rounded-full border-2 transition-all',
            c.bg,
            selected === c.value ? `${c.ring} ring-2` : 'border-transparent hover:border-gray-400'
          )}
          title={c.value.charAt(0) + c.value.slice(1).toLowerCase()}
        />
      ))}
    </div>
  );
}

export const noteColorClasses: Record<NoteColor, string> = {
  DEFAULT: 'bg-white',
  RED: 'bg-red-50',
  ORANGE: 'bg-orange-50',
  YELLOW: 'bg-yellow-50',
  GREEN: 'bg-green-50',
  TEAL: 'bg-teal-50',
  BLUE: 'bg-blue-50',
  PURPLE: 'bg-purple-50',
  GRAY: 'bg-gray-100',
};
