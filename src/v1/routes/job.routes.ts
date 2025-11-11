import { Router } from 'express';
import * as jobController from '../controllers/job.controller';

const router = Router();

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;
