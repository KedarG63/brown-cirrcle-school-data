import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', analyticsController.getDashboard);
router.get('/employee-performance', analyticsController.getEmployeePerformance);
router.get('/visits-by-date', analyticsController.getVisitsByDate);
router.get('/requirements', analyticsController.getRequirements);

export default router;
