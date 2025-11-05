import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/change-password', userController.changePassword);

// Admin only routes
router.put(
  '/:id',
  authorize(UserRole.PI_LAB_MANAGER),
  userController.updateUser
);
router.delete(
  '/:id',
  authorize(UserRole.PI_LAB_MANAGER),
  userController.deleteUser
);

export default router;
