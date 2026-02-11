import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', authorize('ADMIN'), userController.delete);
router.put('/:id/toggle', authorize('ADMIN'), userController.toggleActive);

export default router;
