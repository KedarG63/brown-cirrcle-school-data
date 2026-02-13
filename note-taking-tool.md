# Google Keep-Style Notes Tool Integration
## Technical Specification for School Assessment System

**Project:** School Assessment & CSR Management System  
**Module:** Internal Note-Taking Tool  
**Version:** 1.0  
**Date:** February 13, 2026  
**Architecture:** Node.js + Express + PostgreSQL + Next.js 14

---

## Executive Summary

This document specifies the integration of a Google Keep-inspired note-taking tool into the existing School Assessment Management System. The tool enables admins and employees to capture, organize, and share notes, lists, photos, and ideas related to school visits, requirements documentation, and CSR initiatives[1].

**Core Capabilities:**
- Create and manage text notes, checklists, and photo notes
- Color-coding and label organization
- Pin important notes for quick access
- Search and filter notes
- Share notes with team members (role-based)
- Reminders for follow-up actions
- Archive and trash management
- Real-time synchronization across devices

**Integration Benefits:**
- Centralized information capture for field employees during school visits
- Quick note-taking without formal visit form submission
- Collaborative planning and task tracking for admins
- Photo annotations and quick documentation
- Follow-up reminders for pending requirements

---

## Table of Contents

1. Feature Specifications
2. Database Schema Design
3. API Endpoints
4. Frontend Components
5. Integration Points with Existing System
6. Implementation Roadmap
7. Security Considerations

---

## 1. Feature Specifications

### 1.1 Note Types

**Text Notes**
- Rich text editing with basic formatting
- Maximum 10,000 characters per note
- Auto-save every 2 seconds
- Timestamps for created/updated

**Checklist Notes**
- Multiple checklist items with checkbox state
- Reorder items via drag-and-drop
- Mark completed items
- Show/hide completed items toggle

**Photo Notes**
- Attach up to 5 images per note
- Image captions and descriptions
- GCP Cloud Storage integration (existing infrastructure)
- Thumbnail generation for grid view

### 1.2 Organization Features

**Color Coding**
- 8 predefined colors matching Google Keep palette[1]
- Colors: Default (white), Red, Orange, Yellow, Green, Teal, Blue, Purple, Gray
- Quick color picker in note menu

**Labels/Tags**
- Create custom labels (e.g., "Urgent", "Follow-up", "School Visit", "Requirements")
- Multiple labels per note
- Filter notes by label
- Label management interface

**Pinning**
- Pin important notes to top of list
- Pinned notes displayed in separate section
- Toggle pin/unpin with single click

**Archive**
- Move completed notes to archive
- Archive persists data but removes from main view
- Restore archived notes to active view

**Trash**
- Soft delete with 30-day retention
- Permanently delete after 30 days (automated cron job)
- Restore from trash functionality

### 1.3 Collaboration Features

**Sharing Notes**
- Share note with specific users (admin or employee)
- View-only or edit permissions
- Shared notes show collaborator avatars
- Real-time updates when collaborators edit

**Note Ownership**
- Original creator is owner
- Owner can revoke sharing access
- Transfer ownership to another user (admin only)

### 1.4 Search and Filters

**Search Functionality**
- Full-text search across note title and content
- Search within labels
- Search by color
- Search by date range
- Search by creator/collaborator

**Filter Options**
- Filter by note type (text, checklist, photo)
- Filter by label
- Filter by color
- Filter by shared status
- Filter by date created/modified

### 1.5 Reminders (Optional - Phase 2)

**Time-based Reminders**
- Set reminder date and time
- Browser notification when reminder triggers
- Email notification option
- Snooze reminder functionality

**Location-based Reminders** (Future Enhancement)
- Trigger reminder when near school location
- Requires geolocation permission
- Integration with school GPS coordinates

### 1.6 UI/UX Design

**Layout Options**
- Grid view (default - similar to Google Keep)
- List view (compact)
- Toggle between views via button

**Responsive Design**
- Mobile-optimized for field employees
- Touch-friendly interactions
- Swipe gestures for quick actions

**Quick Actions**
- Right-click context menu
- Hover actions (pin, color, archive, delete)
- Keyboard shortcuts (Ctrl+Enter to save, Delete key, etc.)

---

## 2. Database Schema Design

### 2.1 Entity Relationship Diagram

┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    Notes     │       │   NoteLabels     │       │  NoteShares     │
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │───┐   │ id (PK)          │   ┌──│ id (PK)         │
│ user_id (FK) │   │   │ name             │   │  │ note_id (FK)    │
│ title        │   │   │ color            │   │  │ user_id (FK)    │
│ content      │   │   │ created_by (FK)  │   │  │ permission      │
│ note_type    │   │   │ created_at       │   │  │ shared_at       │
│ color        │   │   └──────────────────┘   │  └─────────────────┘
│ is_pinned    │   │                          │
│ is_archived  │   │                          │
│ is_trashed   │   │   ┌──────────────────┐   │
│ trashed_at   │   │   │ NoteChecklistItem│   │
│ school_id    │   │   ├──────────────────┤   │
│ visit_id     │   └──▶│ note_id (FK)     │   │
│ created_at   │       │ text             │   │
│ updated_at   │       │ is_completed     │   │
└──────────────┘       │ position         │   │
       │               │ created_at       │   │
       │               └──────────────────┘   │
       │                                      │
       └──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐       ┌─────────────────────┐
│      NoteImages              │       │  NoteNoteLables     │
├──────────────────────────────┤       ├─────────────────────┤
│ id (PK)                      │       │ id (PK)             │
│ note_id (FK)                 │       │ note_id (FK)        │
│ image_url                    │       │ label_id (FK)       │
│ image_key                    │       │ created_at          │
│ caption                      │       └─────────────────────┘
│ position                     │
│ uploaded_at                  │
└──────────────────────────────┘

### 2.2 Prisma Schema

// prisma/schema.prisma

enum NoteType {
  TEXT
  CHECKLIST
  PHOTO
}

enum NoteColor {
  DEFAULT
  RED
  ORANGE
  YELLOW
  GREEN
  TEAL
  BLUE
  PURPLE
  GRAY
}

enum SharePermission {
  VIEW
  EDIT
}

model Note {
  id            String      @id @default(uuid())
  userId        String
  title         String?
  content       String?     @db.Text
  noteType      NoteType    @default(TEXT)
  color         NoteColor   @default(DEFAULT)
  isPinned      Boolean     @default(false)
  isArchived    Boolean     @default(false)
  isTrashed     Boolean     @default(false)
  trashedAt     DateTime?
  
  // Optional relations to existing system
  schoolId      String?
  visitId       String?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  school        School?     @relation(fields: [schoolId], references: [id], onDelete: SetNull)
  visit         SchoolVisit? @relation(fields: [visitId], references: [id], onDelete: SetNull)
  checklistItems NoteChecklistItem[]
  images        NoteImage[]
  labels        NoteNoteLabel[]
  shares        NoteShare[]
  
  @@map("notes")
  @@index([userId])
  @@index([schoolId])
  @@index([visitId])
  @@index([isPinned])
  @@index([isArchived])
  @@index([isTrashed])
  @@index([createdAt])
}

model NoteChecklistItem {
  id            String      @id @default(uuid())
  noteId        String
  text          String
  isCompleted   Boolean     @default(false)
  position      Int         @default(0)
  createdAt     DateTime    @default(now())
  
  // Relations
  note          Note        @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  @@map("note_checklist_items")
  @@index([noteId])
}

model NoteImage {
  id            String      @id @default(uuid())
  noteId        String
  imageUrl      String
  imageKey      String
  caption       String?
  position      Int         @default(0)
  uploadedAt    DateTime    @default(now())
  
  // Relations
  note          Note        @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  @@map("note_images")
  @@index([noteId])
}

model NoteLabel {
  id            String      @id @default(uuid())
  name          String      @unique
  color         String?
  createdById   String
  createdAt     DateTime    @default(now())
  
  // Relations
  createdBy     User        @relation("NoteLabelCreatedBy", fields: [createdById], references: [id])
  notes         NoteNoteLabel[]
  
  @@map("note_labels")
  @@index([name])
}

model NoteNoteLabel {
  id            String      @id @default(uuid())
  noteId        String
  labelId       String
  createdAt     DateTime    @default(now())
  
  // Relations
  note          Note        @relation(fields: [noteId], references: [id], onDelete: Cascade)
  label         NoteLabel   @relation(fields: [labelId], references: [id], onDelete: Cascade)
  
  @@map("note_note_labels")
  @@unique([noteId, labelId])
  @@index([noteId])
  @@index([labelId])
}

model NoteShare {
  id            String          @id @default(uuid())
  noteId        String
  userId        String
  permission    SharePermission @default(VIEW)
  sharedAt      DateTime        @default(now())
  
  // Relations
  note          Note            @relation(fields: [noteId], references: [id], onDelete: Cascade)
  user          User            @relation("NoteSharedWith", fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("note_shares")
  @@unique([noteId, userId])
  @@index([noteId])
  @@index([userId])
}

// Update existing User model to add relations
model User {
  // ... existing fields ...
  
  // Notes relations
  notes              Note[]
  labelsCreated      NoteLabel[]  @relation("NoteLabelCreatedBy")
  sharedNotes        NoteShare[]  @relation("NoteSharedWith")
}

// Update existing School model to add relation
model School {
  // ... existing fields ...
  
  // Notes relation
  notes              Note[]
}

// Update existing SchoolVisit model to add relation
model SchoolVisit {
  // ... existing fields ...
  
  // Notes relation
  notes              Note[]
}

### 2.3 Database Migration Strategy

**Migration Steps:**

1. **Create notes tables** without foreign keys to existing system
2. **Test note creation** and basic CRUD operations
3. **Add foreign keys** to `schools` and `school_visits` tables
4. **Add User model relations** for notes functionality
5. **Seed sample data** for testing

**Migration Command:**
# Generate migration
npx prisma migrate dev --name add_notes_module

# Apply to production
npx prisma migrate deploy

---

## 3. API Endpoints

### 3.1 Notes CRUD Endpoints

GET    /api/notes                      # Get all notes for current user
POST   /api/notes                      # Create new note
GET    /api/notes/:id                  # Get note by ID
PUT    /api/notes/:id                  # Update note
DELETE /api/notes/:id                  # Soft delete note (move to trash)

**Query Parameters for GET /api/notes:**
- `type` - Filter by note type (text, checklist, photo)
- `color` - Filter by color
- `label` - Filter by label ID
- `pinned` - Filter pinned notes (true/false)
- `archived` - Filter archived notes (true/false)
- `trashed` - Filter trashed notes (true/false)
- `schoolId` - Filter by school
- `visitId` - Filter by visit
- `search` - Full-text search query
- `page` - Pagination page number
- `limit` - Items per page (default: 50)

### 3.2 Note Actions Endpoints

PUT    /api/notes/:id/pin              # Toggle pin status
PUT    /api/notes/:id/archive          # Toggle archive status
PUT    /api/notes/:id/trash            # Move to trash
PUT    /api/notes/:id/restore          # Restore from trash
DELETE /api/notes/:id/permanent        # Permanently delete (admin only)
PUT    /api/notes/:id/color            # Update note color

### 3.3 Checklist Endpoints

POST   /api/notes/:id/checklist-items          # Add checklist item
PUT    /api/notes/:id/checklist-items/:itemId  # Update checklist item
DELETE /api/notes/:id/checklist-items/:itemId  # Delete checklist item
PUT    /api/notes/:id/checklist-items/reorder  # Reorder checklist items

### 3.4 Image Endpoints

POST   /api/notes/:id/images           # Upload image to note
DELETE /api/notes/:id/images/:imageId  # Delete image from note
PUT    /api/notes/:id/images/reorder   # Reorder images

### 3.5 Label Endpoints

GET    /api/notes/labels               # Get all labels
POST   /api/notes/labels               # Create new label
PUT    /api/notes/labels/:id           # Update label
DELETE /api/notes/labels/:id           # Delete label
POST   /api/notes/:noteId/labels/:labelId   # Add label to note
DELETE /api/notes/:noteId/labels/:labelId   # Remove label from note

### 3.6 Sharing Endpoints

GET    /api/notes/:id/shares           # Get note collaborators
POST   /api/notes/:id/shares           # Share note with user
PUT    /api/notes/:id/shares/:shareId  # Update share permissions
DELETE /api/notes/:id/shares/:shareId  # Remove collaborator

### 3.7 Search Endpoint

GET    /api/notes/search?q=query       # Search notes

### 3.8 API Response Formats

**Note List Response:**
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "School Visit - ABC Primary",
        "content": "Met with principal. Discussed book requirements...",
        "noteType": "TEXT",
        "color": "YELLOW",
        "isPinned": true,
        "isArchived": false,
        "isTrashed": false,
        "school": {
          "id": "uuid",
          "name": "ABC Primary School"
        },
        "labels": [
          { "id": "uuid", "name": "Follow-up", "color": "#FF6B6B" }
        ],
        "images": [
          {
            "id": "uuid",
            "imageUrl": "https://storage.googleapis.com/...",
            "caption": "School building exterior"
          }
        ],
        "checklistItems": [],
        "shares": [
          {
            "user": { "id": "uuid", "name": "Admin User" },
            "permission": "EDIT"
          }
        ],
        "createdAt": "2026-02-10T10:30:00Z",
        "updatedAt": "2026-02-13T14:22:00Z"
      }
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "perPage": 50,
      "totalPages": 3
    }
  }
}

**Checklist Note Response:**
{
  "id": "uuid",
  "title": "Requirements for School Visit",
  "noteType": "CHECKLIST",
  "color": "GREEN",
  "checklistItems": [
    {
      "id": "uuid",
      "text": "Count number of students",
      "isCompleted": true,
      "position": 0
    },
    {
      "id": "uuid",
      "text": "Document furniture needs",
      "isCompleted": false,
      "position": 1
    },
    {
      "id": "uuid",
      "text": "Take photos of classrooms",
      "isCompleted": true,
      "position": 2
    }
  ],
  "createdAt": "2026-02-12T08:00:00Z",
  "updatedAt": "2026-02-13T14:22:00Z"
}

---

## 4. Frontend Components

### 4.1 Component Structure

frontend/
├── app/
│   ├── (employee)/
│   │   └── notes/
│   │       ├── page.tsx              # Main notes page
│   │       ├── [id]/
│   │       │   └── page.tsx          # Note detail/edit page
│   │       └── layout.tsx
│   └── (admin)/
│       └── notes/
│           ├── page.tsx              # Admin notes view
│           └── shared/
│               └── page.tsx          # Shared notes management
├── components/
│   ├── notes/
│   │   ├── NoteCard.tsx              # Individual note card
│   │   ├── NoteGrid.tsx              # Grid layout for notes
│   │   ├── NoteList.tsx              # List layout for notes
│   │   ├── NoteEditor.tsx            # Note editing interface
│   │   ├── ChecklistEditor.tsx       # Checklist editing
│   │   ├── ColorPicker.tsx           # Color selection menu
│   │   ├── LabelPicker.tsx           # Label selection menu
│   │   ├── ShareDialog.tsx           # Share note dialog
│   │   ├── NoteSearch.tsx            # Search bar
│   │   ├── NoteFilters.tsx           # Filter sidebar
│   │   ├── ImageUpload.tsx           # Image upload component
│   │   └── NoteActions.tsx           # Quick actions menu
│   └── layout/
│       └── NotesNavigation.tsx       # Notes sidebar navigation
└── lib/
    ├── api/
    │   └── notes.ts                  # Notes API client
    └── hooks/
        ├── useNotes.ts               # Notes data hook
        ├── useNoteEditor.ts          # Note editing hook
        └── useNoteSearch.ts          # Search hook

### 4.2 Key Components

**NoteCard Component (React)**

// components/notes/NoteCard.tsx
import React from 'react';
import { Note, NoteColor } from '@/types/notes';

interface NoteCardProps {
  note: Note;
  onEdit: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
}

const colorClasses = {
  DEFAULT: 'bg-white dark:bg-gray-800',
  RED: 'bg-red-100 dark:bg-red-900',
  ORANGE: 'bg-orange-100 dark:bg-orange-900',
  YELLOW: 'bg-yellow-100 dark:bg-yellow-900',
  GREEN: 'bg-green-100 dark:bg-green-900',
  TEAL: 'bg-teal-100 dark:bg-teal-900',
  BLUE: 'bg-blue-100 dark:bg-blue-900',
  PURPLE: 'bg-purple-100 dark:bg-purple-900',
  GRAY: 'bg-gray-200 dark:bg-gray-700',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onPin,
  onArchive,
  onDelete,
  onColorChange,
}) => {
  return (
    <div
      className={`rounded-lg border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
        colorClasses[note.color]
      }`}
      onClick={() => onEdit(note.id)}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="flex justify-end mb-2">
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
          </svg>
        </div>
      )}

      {/* Title */}
      {note.title && (
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {note.title}
        </h3>
      )}

      {/* Content preview */}
      {note.noteType === 'TEXT' && note.content && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 mb-3">
          {note.content}
        </p>
      )}

      {/* Checklist preview */}
      {note.noteType === 'CHECKLIST' && (
        <div className="space-y-1 mb-3">
          {note.checklistItems?.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.isCompleted}
                readOnly
                className="w-4 h-4"
              />
              <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                {item.text}
              </span>
            </div>
          ))}
          {note.checklistItems && note.checklistItems.length > 3 && (
            <p className="text-xs text-gray-500 pl-6">
              +{note.checklistItems.length - 3} more items
            </p>
          )}
        </div>
      )}

      {/* Images preview */}
      {note.images && note.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {note.images.slice(0, 4).map((image) => (
            <img
              key={image.id}
              src={image.imageUrl}
              alt={image.caption || ''}
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* Labels */}
      {note.labels && note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Collaboration indicator */}
      {note.shares && note.shares.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span className="text-xs text-gray-500">
            Shared with {note.shares.length} {note.shares.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-xs text-gray-500">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onPin(note.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
            </svg>
          </button>
          
          <button
            onClick={() => onArchive(note.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Archive"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

**NoteEditor Component (React)**

// components/notes/NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import { Note, NoteType } from '@/types/notes';
import { ChecklistEditor } from './ChecklistEditor';
import { ImageUpload } from './ImageUpload';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Partial<Note>) => Promise<void>;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(note?.noteType || 'TEXT');
  const [saving, setSaving] = useState(false);

  // Auto-save on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note?.id && (title !== note.title || content !== note.content)) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleAutoSave = async () => {
    if (!note?.id) return;
    
    setSaving(true);
    try {
      await onSave({ id: note.id, title, content });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    setSaving(true);
    try {
      await onSave({ title, content, noteType });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNoteType('TEXT')}
              className={`px-3 py-1 rounded ${noteType === 'TEXT' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Text
            </button>
            <button
              onClick={() => setNoteType('CHECKLIST')}
              className={`px-3 py-1 rounded ${noteType === 'CHECKLIST' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Checklist
            </button>
            <button
              onClick={() => setNoteType('PHOTO')}
              className={`px-3 py-1 rounded ${noteType === 'PHOTO' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Photo
            </button>
          </div>
          
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-xl font-semibold border-none outline-none mb-4 bg-transparent"
          />

          {/* Text Content */}
          {noteType === 'TEXT' && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full min-h-[200px] border-none outline-none resize-none bg-transparent"
            />
          )}

          {/* Checklist */}
          {noteType === 'CHECKLIST' && (
            <ChecklistEditor noteId={note?.id} items={note?.checklistItems || []} />
          )}

          {/* Image Upload */}
          {noteType === 'PHOTO' && (
            <ImageUpload noteId={note?.id} existingImages={note?.images || []} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-gray-500">Saving...</span>}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {note?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

### 4.3 Page Layout

**Notes Main Page (Next.js)**

// app/(employee)/notes/page.tsx
'use client';

import React, { useState } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteSearch } from '@/components/notes/NoteSearch';
import { NoteFilters } from '@/components/notes/NoteFilters';

export default function NotesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  const {
    notes,
    pinnedNotes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    filters,
    setFilters,
  } = useNotes();

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        
        <div className="flex items-center gap-4">
          <NoteSearch onSearch={(query) => setFilters({ ...filters, search: query })} />
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border rounded hover:bg-gray-100"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          
          <button
            onClick={() => {
              setSelectedNote(null);
              setShowEditor(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + New Note
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <NoteFilters filters={filters} onFilterChange={setFilters} />
        </aside>

        {/* Notes Content */}
        <main className="flex-1">
          {loading ? (
            <div className="text-center py-12">Loading notes...</div>
          ) : (
            <>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Pinned</h2>
                  {viewMode === 'grid' ? (
                    <NoteGrid notes={pinnedNotes} onEdit={setSelectedNote} />
                  ) : (
                    <NoteList notes={pinnedNotes} onEdit={setSelectedNote} />
                  )}
                </section>
              )}

              {/* Regular Notes */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Others</h2>
                {viewMode === 'grid' ? (
                  <NoteGrid notes={notes} onEdit={setSelectedNote} />
                ) : (
                  <NoteList notes={notes} onEdit={setSelectedNote} />
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={selectedNote}
          onSave={selectedNote ? updateNote : createNote}
          onClose={() => {
            setShowEditor(false);
            setSelectedNote(null);
          }}
        />
      )}
    </div>
  );
}

---

## 5. Integration Points with Existing System

### 5.1 School Visit Integration

**Use Case:** Create quick notes during school visits

**Implementation:**
- Add "Quick Note" button on visit form
- Pre-populate note with school and visit context
- Auto-link note to `schoolId` and `visitId`
- Display related notes in visit detail page

**Code Example:**
// In visit form component
const handleQuickNote = async () => {
  await createNote({
    title: `Note for ${school.name} visit`,
    schoolId: school.id,
    visitId: visit.id,
    noteType: 'TEXT'
  });
};

### 5.2 Requirements Documentation

**Use Case:** Capture informal requirements before formal submission

**Implementation:**
- Convert note checklist to formal requirements
- "Export to Visit Form" button in note editor
- Map checklist items to requirement fields
- Preserve original note as reference

### 5.3 Employee Dashboard Integration

**Use Case:** Display recent notes on dashboard

**Implementation:**
- Add "Recent Notes" widget on employee dashboard
- Show 5 most recent notes
- Quick access to create new note
- Filter by current day's notes

### 5.4 Admin Analytics

**Use Case:** Track note-taking activity

**Implementation:**
- Add "Notes Activity" section to admin dashboard
- Show notes created per employee
- Most active note-takers
- Notes by school/visit correlation

### 5.5 Search Integration

**Use Case:** Global search includes notes

**Implementation:**
- Extend existing search to include notes
- Search across note title, content, labels
- Filter search results by entity type
- Unified search results page

---

## 6. Implementation Roadmap

### Phase 1: Core Note Features (Week 1-2)

**Week 1: Backend Foundation**
- [ ] Create database schema and Prisma migration
- [ ] Implement Notes CRUD API endpoints
- [ ] Add authentication middleware for notes
- [ ] Create note service layer
- [ ] Write unit tests for note operations

**Week 2: Basic Frontend**
- [ ] Create note card component
- [ ] Build note grid and list layouts
- [ ] Implement note editor modal
- [ ] Add color picker functionality
- [ ] Basic note creation and editing

### Phase 2: Advanced Features (Week 3-4)

**Week 3: Checklists and Images**
- [ ] Checklist item CRUD endpoints
- [ ] Image upload integration (existing GCS)
- [ ] Checklist editor component
- [ ] Image upload component
- [ ] Reordering functionality

**Week 4: Organization Features**
- [ ] Label management (backend + frontend)
- [ ] Pin/archive/trash functionality
- [ ] Color coding implementation
- [ ] Filter and sort options
- [ ] Search functionality

### Phase 3: Collaboration & Integration (Week 5-6)

**Week 5: Sharing Features**
- [ ] Note sharing backend
- [ ] Share dialog component
- [ ] Permission management
- [ ] Real-time updates (optional - Socket.io)
- [ ] Collaboration notifications

**Week 6: System Integration**
- [ ] School visit integration
- [ ] Dashboard widgets
- [ ] Admin analytics
- [ ] Global search integration
- [ ] Requirements export functionality

### Phase 4: Polish & Testing (Week 7)

- [ ] Mobile responsiveness optimization
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (ARIA labels)
- [ ] Performance optimization (pagination, lazy loading)
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Documentation

### Phase 5: Deployment (Week 8)

- [ ] Database migration to production
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Performance monitoring setup
- [ ] User training materials
- [ ] Launch announcement

---

## 7. Security Considerations

### 7.1 Access Control

**Authorization Rules:**
- Users can only access their own notes
- Shared notes accessible based on permission level
- Admins can view all notes (optional flag in system settings)
- Soft-deleted notes only accessible by owner for 30 days

**Implementation:**
// middleware/noteAccess.ts
export const checkNoteAccess = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user.id;
  
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { shares: true }
  });
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  // Check ownership or shared access
  const hasAccess = 
    note.userId === userId ||
    note.shares.some(share => share.userId === userId);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  req.note = note;
  next();
};

### 7.2 Data Validation

**Input Sanitization:**
- Sanitize HTML content to prevent XSS
- Validate note type enum values
- Limit title length (200 characters)
- Limit content length (10,000 characters)
- Validate image file types and sizes

**Validation Schema (Zod):**
import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(10000).optional(),
  noteType: z.enum(['TEXT', 'CHECKLIST', 'PHOTO']),
  color: z.enum(['DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'TEAL', 'BLUE', 'PURPLE', 'GRAY']).optional(),
  schoolId: z.string().uuid().optional(),
  visitId: z.string().uuid().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

### 7.3 Image Security

**Image Upload Security:**
- Reuse existing GCP Cloud Storage setup
- Validate MIME types (image/jpeg, image/png, image/webp)
- Maximum 5 images per note
- Maximum 5MB per image
- Generate unique filenames (UUID)
- Store images in `notes/` folder in existing bucket

### 7.4 Rate Limiting

**API Rate Limits:**
- Note creation: 20 per minute per user
- Note updates: 60 per minute per user
- Image uploads: 10 per minute per user
- Search queries: 30 per minute per user

### 7.5 Data Privacy

**Privacy Measures:**
- Notes are private by default
- Explicit sharing required for collaboration
- Audit log for shared note access
- GDPR compliance - user data export/deletion
- Encrypted storage for sensitive notes (future)

### 7.6 Trash & Permanent Deletion

**Deletion Policy:**
- Soft delete moves to trash (30-day retention)
- Cron job auto-deletes after 30 days
- Manual permanent delete (admin only)
- Cascade delete note images from GCS
- Preserve audit trail for deleted notes

**Cron Job Implementation:**
// scripts/cleanupTrash.ts
import { PrismaClient } from '@prisma/client';
import { deleteFromGCS } from '../services/storageService';

const prisma = new PrismaClient();

async function cleanupTrash() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Find notes to delete
  const notesToDelete = await prisma.note.findMany({
    where: {
      isTrashed: true,
      trashedAt: { lte: thirtyDaysAgo }
    },
    include: { images: true }
  });
  
  for (const note of notesToDelete) {
    // Delete images from GCS
    for (const image of note.images) {
      await deleteFromGCS(image.imageKey);
    }
    
    // Permanently delete note
    await prisma.note.delete({ where: { id: note.id } });
  }
  
  console.log(`Cleaned up ${notesToDelete.length} trashed notes`);
}

cleanupTrash()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

**Schedule in PM2:**
// ecosystem.config.js - add to existing config
{
  name: 'cleanup-trash',
  script: 'dist/scripts/cleanupTrash.js',
  cron_restart: '0 2 * * *', // Run daily at 2 AM
  autorestart: false
}

---

## Appendix A: API Examples

### Create Text Note

**Request:**
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Follow-up with ABC School",
  "content": "Principal mentioned need for 50 books and 20 uniforms. Schedule follow-up visit next week.",
  "noteType": "TEXT",
  "color": "YELLOW",
  "schoolId": "uuid-of-school",
  "visitId": "uuid-of-visit"
}

**Response:**
{
  "success": true,
  "data": {
    "id": "note-uuid",
    "title": "Follow-up with ABC School",
    "content": "Principal mentioned need for 50 books and 20 uniforms...",
    "noteType": "TEXT",
    "color": "YELLOW",
    "isPinned": false,
    "isArchived": false,
    "isTrashed": false,
    "schoolId": "uuid-of-school",
    "visitId": "uuid-of-visit",
    "createdAt": "2026-02-13T14:30:00Z",
    "updatedAt": "2026-02-13T14:30:00Z"
  }
}

### Create Checklist Note

**Request:**
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Visit Preparation Checklist",
  "noteType": "CHECKLIST",
  "color": "GREEN",
  "checklistItems": [
    { "text": "Bring camera", "isCompleted": false, "position": 0 },
    { "text": "Print requirement forms", "isCompleted": false, "position": 1 },
    { "text": "Coordinate with principal", "isCompleted": true, "position": 2 }
  ]
}

### Share Note

**Request:**
POST /api/notes/note-uuid/shares
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid-to-share-with",
  "permission": "EDIT"
}

**Response:**
{
  "success": true,
  "data": {
    "id": "share-uuid",
    "noteId": "note-uuid",
    "userId": "user-uuid-to-share-with",
    "permission": "EDIT",
    "sharedAt": "2026-02-13T14:35:00Z"
  }
}

### Search Notes

**Request:**
GET /api/notes/search?q=school%20visit&label=follow-up&color=YELLOW
Authorization: Bearer <token>

**Response:**
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "note-uuid",
        "title": "Follow-up with ABC School",
        "content": "Principal mentioned...",
        "highlights": {
          "title": ["Follow-up", "School"],
          "content": ["school visit", "mentioned"]
        },
        "matchScore": 0.95
      }
    ],
    "total": 1
  }
}

---

## Appendix B: Cost Impact Analysis

### Database Storage Costs

**Assumptions:**
- 10 employees × 10 notes/day = 100 notes/day
- Average note size: 2KB (text + metadata)
- Daily storage: 100 × 2KB = 200KB/day
- Monthly storage: 200KB × 30 = 6MB/month
- Annual storage: 6MB × 12 = 72MB/year

**PostgreSQL Impact:**
- Negligible impact on existing VM-hosted PostgreSQL
- Notes tables add ~72MB/year
- No additional database costs

### Image Storage Costs

**Assumptions:**
- 20% of notes include images (20 notes/day)
- Average 2 images per photo note
- Average image size after compression: 500KB
- Daily image storage: 20 × 2 × 500KB = 20MB/day
- Monthly image storage: 20MB × 30 = 600MB/month

**GCP Cloud Storage Costs:**
- Current free tier: 5GB/month
- With notes: 0.6GB used for notes images
- Still within free tier (4.4GB remaining)
- **Additional cost: ₹0/month** (within existing free tier)

### Bandwidth Costs

**Assumptions:**
- 100 notes viewed/day × 30 days = 3,000 note views/month
- Average data transfer per view: 100KB (note + images)
- Monthly bandwidth: 3,000 × 100KB = 300MB/month

**GCP Network Egress:**
- Free tier: 1GB/month (India)
- With notes: 0.3GB used
- Still within free tier
- **Additional cost: ₹0/month**

### Total Cost Impact

| Resource | Current Usage | With Notes | Additional Cost |
|----------|--------------|------------|-----------------|
| VM Compute | e2-micro (free) | e2-micro (free) | ₹0 |
| Database | VM-hosted | VM-hosted | ₹0 |
| Storage | ~2GB | ~2.6GB | ₹0 (within free tier) |
| Bandwidth | ~500MB | ~800MB | ₹0 (within free tier) |
| **Monthly Total** | **₹150-500** | **₹150-500** | **₹0** |

**Conclusion:** Notes feature adds **zero additional hosting cost** within current infrastructure and free tier limits[2][5].

---

## Appendix C: Testing Checklist

### Unit Tests

- [ ] Note CRUD operations (create, read, update, delete)
- [ ] Checklist item management
- [ ] Image upload and deletion
- [ ] Label management
- [ ] Share permission logic
- [ ] Search functionality
- [ ] Soft delete and restore
- [ ] Permanent deletion

### Integration Tests

- [ ] Note creation with school/visit association
- [ ] Sharing workflow (share, edit, revoke)
- [ ] Image upload to GCP Cloud Storage
- [ ] Trash cleanup cron job
- [ ] Search with filters
- [ ] Export to visit requirements
- [ ] Dashboard widget integration

### Frontend Tests

- [ ] Note card rendering
- [ ] Note editor modal
- [ ] Checklist interaction
- [ ] Image upload progress
- [ ] Color picker
- [ ] Label picker
- [ ] Share dialog
- [ ] Search bar
- [ ] Filter sidebar
- [ ] Grid/list view toggle

### End-to-End Tests

- [ ] Complete note lifecycle (create → edit → share → archive → delete)
- [ ] Employee creates note during visit
- [ ] Admin views shared notes
- [ ] Note search and filter workflow
- [ ] Image upload and display
- [ ] Checklist completion tracking
- [ ] Mobile responsive behavior

### Performance Tests

- [ ] Load 100+ notes in grid view
- [ ] Search with 1000+ notes
- [ ] Image upload speed
- [ ] Auto-save latency
- [ ] Concurrent editing (shared notes)

### Security Tests

- [ ] Unauthorized note access
- [ ] XSS prevention in note content
- [ ] File upload validation
- [ ] Rate limiting enforcement
- [ ] SQL injection prevention
- [ ] CSRF protection

---

## References

[1] Google Keep - Wikipedia. Features and functionality of Google Keep note-taking service. https://en.wikipedia.org/wiki/Google_Keep

[2] Google Workspace: Google Keep. Official product page detailing Keep's capabilities. https://workspace.google.com/products/keep/

[3] Reddit - Database Architecture of Note-taking Apps. Discussion on database schema design for flexible note applications. https://www.reddit.com/r/webdev/comments/17twwhs/what_is_the_database_architecture_of_notetaking/

[4] GitHub - Real-time Notes Pad. Self-hosted collaborative note-taking with WebSockets. https://github.com/jonathas/realtime-notes-pad

[5] GCP Cloud Storage Best Practices. Google Cloud Platform storage optimization guidelines. https://cloud.google.com/storage/docs/best-practices

[6] Building Real-Time Collaboration Features. Guide to implementing real-time collaboration in web apps. https://blog.pixelfreestudio.com/how-to-implement-real-time-collaboration-features-in-web-apps/

[7] Back4App - Task and To-Do List Database Schema. Database design patterns for task management applications. https://www.back4app.com/tutorials/how-to-design-a-database-schema-for-a-task-and-to-do-list-management-app

---

**Document Version:** 1.0  
**Last Updated:** February 13, 2026  
**Target Integration:** School Assessment & CSR Management System (GCP Single-VM)  
**Estimated Timeline:** 8 weeks  
**Additional Cost:** ₹0/month (within existing free tier)

---

**END OF SPECIFICATION**