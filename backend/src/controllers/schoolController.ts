import { Request, Response, NextFunction } from 'express';
import { schoolService } from '../services/schoolService';

export const schoolController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;
      const search = req.query.search as string | undefined;
      const result = await schoolService.getAll(page, perPage, search);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await schoolService.getById(req.params.id);
      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await schoolService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({ success: true, data: school, message: 'School created successfully' });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await schoolService.update(req.params.id, req.body);
      res.json({ success: true, data: school, message: 'School updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await schoolService.delete(req.params.id);
      res.json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
