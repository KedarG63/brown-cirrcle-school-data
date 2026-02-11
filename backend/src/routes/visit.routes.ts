import { Router } from 'express';
import { visitController } from '../controllers/visitController';
import { authenticate } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const visitSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  visitDate: z.string().min(1, 'Visit date is required'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED']).optional(),
  requirements: z
    .object({
      booksNeeded: z.boolean().optional(),
      booksQuantity: z.number().optional(),
      uniformsNeeded: z.boolean().optional(),
      uniformsQuantity: z.number().optional(),
      furnitureNeeded: z.boolean().optional(),
      furnitureDetails: z.string().optional(),
      paintingNeeded: z.boolean().optional(),
      paintingArea: z.string().optional(),
      otherCoreRequirements: z.string().optional(),
      tvNeeded: z.boolean().optional(),
      tvQuantity: z.number().optional(),
      wifiNeeded: z.boolean().optional(),
      wifiDetails: z.string().optional(),
      computersNeeded: z.boolean().optional(),
      computersQuantity: z.number().optional(),
      otherDevRequirements: z.string().optional(),
      notes: z.string().optional(),
      estimatedBudget: z.number().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    })
    .optional(),
});

router.get('/', visitController.getAll);
router.post('/', validate(visitSchema), visitController.create);
router.get('/:id', visitController.getById);
router.put('/:id', visitController.update);
router.delete('/:id', visitController.delete);
router.post('/:id/images', uploadMultiple, visitController.uploadImages);
router.delete('/images/:imageId', visitController.deleteImage);

export default router;
