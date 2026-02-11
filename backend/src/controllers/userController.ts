import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;
      const search = req.query.search as string | undefined;
      const result = await userService.getAll(page, perPage, search);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json({ success: true, data: user, message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.toggleActive(req.params.id);
      res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
