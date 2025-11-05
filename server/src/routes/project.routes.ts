import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Project members
router.post('/:id/members', projectController.addProjectMember);
router.delete('/:id/members/:memberId', projectController.removeProjectMember);

// Project updates
router.post('/:id/updates', projectController.addProjectUpdate);

// AI insights
router.get('/:id/insights', projectController.getProjectInsights);

export default router;
