import { Request, Response, NextFunction } from 'express';
import { visitService } from '../services/visitService';
import { storageService } from '../services/storageService';

export const visitController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params: any = {
        page: parseInt(req.query.page as string) || 1,
        perPage: parseInt(req.query.perPage as string) || 10,
      };
      if (req.query.employeeId) params.employeeId = req.query.employeeId;
      if (req.query.schoolId) params.schoolId = req.query.schoolId;
      if (req.query.status) params.status = req.query.status;
      if (req.query.startDate) params.startDate = req.query.startDate;
      if (req.query.endDate) params.endDate = req.query.endDate;

      // Employees can only see their own visits
      if (req.user!.role === 'EMPLOYEE') {
        params.employeeId = req.user!.userId;
      }

      const result = await visitService.getAll(params);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await visitService.getById(req.params.id);
      res.json({ success: true, data: visit });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await visitService.create({
        ...req.body,
        employeeId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: visit, message: 'Visit created successfully' });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await visitService.update(req.params.id, req.body);
      res.json({ success: true, data: visit, message: 'Visit updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await visitService.delete(req.params.id);
      res.json({ success: true, message: 'Visit deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No images provided' });
        return;
      }

      const uploadPromises = files.map((file) =>
        storageService.uploadToGCS(file, `visits/${id}`)
      );
      const uploadResults = await Promise.all(uploadPromises);

      const images = uploadResults.map((result, index) => ({
        imageUrl: result.url,
        imageKey: result.key,
        imageType: req.body.imageTypes?.[index] || 'general',
      }));

      const result = await visitService.addImages(id, images);
      res.json({ success: true, data: { count: result.count }, message: 'Images uploaded successfully' });
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const image = await visitService.deleteImage(req.params.imageId);
      await storageService.deleteFromGCS(image.imageKey);
      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
