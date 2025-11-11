import { Router } from 'express';
import * as ganttTaskController from '../controllers/ganttTask.controller';
import { validateGanttTask } from '../middlewares/ganttTask.middleware';

const router = Router();

router.get('/', ganttTaskController.getGanttTasks);
router.get('/:id', ganttTaskController.getGanttTaskById);
router.get('/project/:projectId', ganttTaskController.getGanttTasksByProjectId);
router.post('/', validateGanttTask, ganttTaskController.createGanttTask);
router.put('/:id', validateGanttTask, ganttTaskController.updateGanttTask);
router.delete('/:id', ganttTaskController.deleteGanttTask);
router.post('/swap-position', ganttTaskController.swapGanttTaskPosition);

export default router;
