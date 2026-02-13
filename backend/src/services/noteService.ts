import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { NoteType, NoteColor } from '@prisma/client';

const noteInclude = {
  checklistItems: { orderBy: { position: 'asc' as const } },
  labels: {
    include: {
      label: { select: { id: true, name: true, color: true } },
    },
  },
  school: { select: { id: true, name: true } },
  visit: { select: { id: true, visitDate: true } },
  user: { select: { id: true, name: true } },
};

export const noteService = {
  async getAll(params: {
    userId: string;
    page?: number;
    perPage?: number;
    type?: NoteType;
    color?: NoteColor;
    labelId?: string;
    pinned?: boolean;
    archived?: boolean;
    trashed?: boolean;
    schoolId?: string;
    visitId?: string;
    search?: string;
  }) {
    const {
      userId,
      page = 1,
      perPage = 50,
      type,
      color,
      labelId,
      pinned,
      archived = false,
      trashed = false,
      schoolId,
      visitId,
      search,
    } = params;

    const where: any = {
      userId,
      isArchived: archived,
      isTrashed: trashed,
    };

    if (type) where.noteType = type;
    if (color) where.color = color;
    if (pinned !== undefined) where.isPinned = pinned;
    if (schoolId) where.schoolId = schoolId;
    if (visitId) where.visitId = visitId;

    if (labelId) {
      where.labels = { some: { labelId } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: noteInclude,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      }),
      prisma.note.count({ where }),
    ]);

    return {
      items: notes,
      pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    };
  },

  async getById(id: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id },
      include: noteInclude,
    });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);
    return note;
  },

  async create(data: {
    userId: string;
    title?: string;
    content?: string;
    noteType?: NoteType;
    color?: NoteColor;
    schoolId?: string;
    visitId?: string;
    checklistItems?: { text: string; isCompleted?: boolean; position?: number }[];
  }) {
    const note = await prisma.note.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        noteType: data.noteType || 'TEXT',
        color: data.color || 'DEFAULT',
        schoolId: data.schoolId,
        visitId: data.visitId,
        checklistItems: data.checklistItems
          ? {
              create: data.checklistItems.map((item, index) => ({
                text: item.text,
                isCompleted: item.isCompleted || false,
                position: item.position ?? index,
              })),
            }
          : undefined,
      },
      include: noteInclude,
    });
    return note;
  },

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      content?: string;
      noteType?: NoteType;
      color?: NoteColor;
      schoolId?: string | null;
      visitId?: string | null;
    }
  ) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data,
      include: noteInclude,
    });
  },

  async togglePin(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data: { isPinned: !note.isPinned },
      include: noteInclude,
    });
  },

  async toggleArchive(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data: {
        isArchived: !note.isArchived,
        isPinned: false,
      },
      include: noteInclude,
    });
  },

  async moveToTrash(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data: {
        isTrashed: true,
        trashedAt: new Date(),
        isPinned: false,
        isArchived: false,
      },
    });
  },

  async restoreFromTrash(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data: {
        isTrashed: false,
        trashedAt: null,
      },
      include: noteInclude,
    });
  },

  async permanentDelete(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    await prisma.note.delete({ where: { id } });
  },

  async updateColor(id: string, userId: string, color: NoteColor) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.note.update({
      where: { id },
      data: { color },
      include: noteInclude,
    });
  },

  // Checklist items
  async addChecklistItem(noteId: string, userId: string, data: { text: string; position?: number }) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    const maxPosition = await prisma.noteChecklistItem.aggregate({
      where: { noteId },
      _max: { position: true },
    });

    return prisma.noteChecklistItem.create({
      data: {
        noteId,
        text: data.text,
        position: data.position ?? (maxPosition._max.position ?? -1) + 1,
      },
    });
  },

  async updateChecklistItem(
    noteId: string,
    itemId: string,
    userId: string,
    data: { text?: string; isCompleted?: boolean; position?: number }
  ) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    const item = await prisma.noteChecklistItem.findUnique({ where: { id: itemId } });
    if (!item || item.noteId !== noteId) throw new AppError('Checklist item not found', 404);

    return prisma.noteChecklistItem.update({
      where: { id: itemId },
      data,
    });
  },

  async deleteChecklistItem(noteId: string, itemId: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    const item = await prisma.noteChecklistItem.findUnique({ where: { id: itemId } });
    if (!item || item.noteId !== noteId) throw new AppError('Checklist item not found', 404);

    await prisma.noteChecklistItem.delete({ where: { id: itemId } });
  },

  // Labels
  async getAllLabels(userId: string) {
    return prisma.noteLabel.findMany({
      where: { createdById: userId },
      orderBy: { name: 'asc' },
    });
  },

  async createLabel(userId: string, data: { name: string; color?: string }) {
    return prisma.noteLabel.create({
      data: {
        name: data.name,
        color: data.color,
        createdById: userId,
      },
    });
  },

  async updateLabel(labelId: string, userId: string, data: { name?: string; color?: string }) {
    const label = await prisma.noteLabel.findUnique({ where: { id: labelId } });
    if (!label) throw new AppError('Label not found', 404);
    if (label.createdById !== userId) throw new AppError('Access denied', 403);

    return prisma.noteLabel.update({
      where: { id: labelId },
      data,
    });
  },

  async deleteLabel(labelId: string, userId: string) {
    const label = await prisma.noteLabel.findUnique({ where: { id: labelId } });
    if (!label) throw new AppError('Label not found', 404);
    if (label.createdById !== userId) throw new AppError('Access denied', 403);

    await prisma.noteLabel.delete({ where: { id: labelId } });
  },

  async addLabelToNote(noteId: string, labelId: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    return prisma.noteNoteLabel.create({
      data: { noteId, labelId },
      include: { label: true },
    });
  },

  async removeLabelFromNote(noteId: string, labelId: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new AppError('Note not found', 404);
    if (note.userId !== userId) throw new AppError('Access denied', 403);

    await prisma.noteNoteLabel.delete({
      where: { noteId_labelId: { noteId, labelId } },
    });
  },
};
