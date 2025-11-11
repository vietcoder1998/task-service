import { Router } from 'express';
import * as labelController from '../controllers/label.controller';

const router = Router();

router.get('/project/:projectId', labelController.getLabelsByProjectId);
router.post('/', labelController.createLabel);

export default router;
