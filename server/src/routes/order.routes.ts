import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', orderController.getAllOrders);
router.get('/pending-approvals', orderController.getPendingApprovals);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

// Status updates (approval requires higher privileges)
router.patch(
  '/:id/status',
  authorize(UserRole.PI_LAB_MANAGER, UserRole.POSTDOC_STAFF),
  orderController.updateOrderStatus
);

export default router;
