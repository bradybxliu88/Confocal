import { Router } from 'express';
import * as equipmentController from '../controllers/equipmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Equipment CRUD
router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', equipmentController.createEquipment);
router.put('/:id', equipmentController.updateEquipment);
router.delete('/:id', equipmentController.deleteEquipment);

// Equipment schedule
router.get('/:id/schedule', equipmentController.getEquipmentSchedule);

// Bookings
router.get('/bookings/all', equipmentController.getAllBookings);
router.post('/bookings', equipmentController.createBooking);
router.put('/bookings/:id', equipmentController.updateBooking);
router.delete('/bookings/:id', equipmentController.deleteBooking);

export default router;
