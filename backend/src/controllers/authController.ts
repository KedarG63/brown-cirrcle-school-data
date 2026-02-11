import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user, message: 'User registered successfully' });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new AppError('Refresh token required', 400);
      const tokens = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out successfully' });
  },
};
