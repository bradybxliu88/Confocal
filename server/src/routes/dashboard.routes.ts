import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getActivityFeed);
router.get('/alerts', dashboardController.getUserAlerts);
router.patch('/alerts/:id/read', dashboardController.markAlertAsRead);
router.patch('/alerts/read-all', dashboardController.markAllAlertsAsRead);

export default router;
