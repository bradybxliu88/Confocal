import { Router } from 'express';
import * as protocolController from '../controllers/protocolController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', protocolController.getAllProtocols);
router.get('/categories/list', protocolController.getProtocolCategories);
router.get('/:id', protocolController.getProtocolById);
router.post('/', protocolController.createProtocol);
router.put('/:id', protocolController.updateProtocol);
router.delete('/:id', protocolController.deleteProtocol);

export default router;
