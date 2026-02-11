import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboard();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getEmployeePerformance(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getEmployeePerformance();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getVisitsByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const data = await analyticsService.getVisitsByDate(
        (startDate as string) || thirtyDaysAgo.toISOString(),
        (endDate as string) || new Date().toISOString()
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getRequirements(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRequirementsAggregation();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
