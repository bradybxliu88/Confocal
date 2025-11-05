import { Router } from 'express';
import * as reagentController from '../controllers/reagentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', reagentController.getAllReagents);
router.get('/alerts/low-stock', reagentController.getLowStockAlerts);
router.get('/alerts/expiring', reagentController.getExpiringReagents);
router.get('/:id', reagentController.getReagentById);
router.post('/', reagentController.createReagent);
router.put('/:id', reagentController.updateReagent);
router.delete('/:id', reagentController.deleteReagent);

// Barcode scanning
router.get('/scan/:barcode', reagentController.scanBarcode);

// AI storage suggestions
router.post('/suggestions/storage', reagentController.getStorageSuggestions);

export default router;
