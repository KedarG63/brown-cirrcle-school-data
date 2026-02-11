import { Router } from 'express';
import { schoolController } from '../controllers/schoolController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

router.get('/', schoolController.getAll);
router.post('/', validate(schoolSchema), schoolController.create);
router.get('/:id', schoolController.getById);
router.put('/:id', schoolController.update);
router.delete('/:id', schoolController.delete);

export default router;
