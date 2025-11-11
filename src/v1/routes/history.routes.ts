import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { validateHistory } from '../middlewares/history.middleware';

const router = Router();

router.get('/', historyController.getHistories);
router.post('/', validateHistory, historyController.createHistory);
router.put('/:id', validateHistory, historyController.updateHistory);
router.delete('/:id', historyController.deleteHistory);

export default router;
