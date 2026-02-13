import { Request, Response, NextFunction } from 'express';
import { noteService } from '../services/noteService';
import { NoteType, NoteColor } from '@prisma/client';

export const noteController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params: any = {
        userId: req.user!.userId,
        page: parseInt(req.query.page as string) || 1,
        perPage: parseInt(req.query.perPage as string) || 50,
      };
      if (req.query.type) params.type = req.query.type as NoteType;
      if (req.query.color) params.color = req.query.color as NoteColor;
      if (req.query.labelId) params.labelId = req.query.labelId;
      if (req.query.pinned) params.pinned = req.query.pinned === 'true';
      if (req.query.archived) params.archived = req.query.archived === 'true';
      if (req.query.trashed) params.trashed = req.query.trashed === 'true';
      if (req.query.schoolId) params.schoolId = req.query.schoolId;
      if (req.query.visitId) params.visitId = req.query.visitId;
      if (req.query.search) params.search = req.query.search;

      const result = await noteService.getAll(params);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.getById(req.params.id, req.user!.userId);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: note, message: 'Note created successfully' });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.update(req.params.id, req.user!.userId, req.body);
      res.json({ success: true, data: note, message: 'Note updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.togglePin(req.params.id, req.user!.userId);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async toggleArchive(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.toggleArchive(req.params.id, req.user!.userId);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  async moveToTrash(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.moveToTrash(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Note moved to trash' });
    } catch (error) {
      next(error);
    }
  },

  async restoreFromTrash(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.restoreFromTrash(req.params.id, req.user!.userId);
      res.json({ success: true, data: note, message: 'Note restored' });
    } catch (error) {
      next(error);
    }
  },

  async permanentDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.permanentDelete(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Note permanently deleted' });
    } catch (error) {
      next(error);
    }
  },

  async updateColor(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await noteService.updateColor(req.params.id, req.user!.userId, req.body.color);
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },

  // Checklist items
  async addChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await noteService.addChecklistItem(req.params.id, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async updateChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await noteService.updateChecklistItem(
        req.params.id,
        req.params.itemId,
        req.user!.userId,
        req.body
      );
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async deleteChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.deleteChecklistItem(req.params.id, req.params.itemId, req.user!.userId);
      res.json({ success: true, message: 'Checklist item deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Labels
  async getAllLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await noteService.getAllLabels(req.user!.userId);
      res.json({ success: true, data: labels });
    } catch (error) {
      next(error);
    }
  },

  async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await noteService.createLabel(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: label, message: 'Label created' });
    } catch (error) {
      next(error);
    }
  },

  async updateLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await noteService.updateLabel(req.params.id, req.user!.userId, req.body);
      res.json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  },

  async deleteLabel(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.deleteLabel(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Label deleted' });
    } catch (error) {
      next(error);
    }
  },

  async addLabelToNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await noteService.addLabelToNote(
        req.params.noteId,
        req.params.labelId,
        req.user!.userId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async removeLabelFromNote(req: Request, res: Response, next: NextFunction) {
    try {
      await noteService.removeLabelFromNote(
        req.params.noteId,
        req.params.labelId,
        req.user!.userId
      );
      res.json({ success: true, message: 'Label removed from note' });
    } catch (error) {
      next(error);
    }
  },
};
