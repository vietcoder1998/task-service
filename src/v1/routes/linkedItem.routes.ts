import { Router } from 'express';
import * as linkedItemController from '../controllers/linkedItem.controller';
import { validateLinkedItem } from '../middlewares/linkedItem.middleware';

const router = Router();

router.get('/', linkedItemController.getLinkedItems);
router.post('/', validateLinkedItem, linkedItemController.createLinkedItem);
router.put('/:id', validateLinkedItem, linkedItemController.updateLinkedItem);
router.delete('/:id', linkedItemController.deleteLinkedItem);

export default router;
