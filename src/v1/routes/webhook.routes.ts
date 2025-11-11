import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';
import { validateWebhook } from '../middlewares/webhook.middleware';

const router = Router();

router.get('/', webhookController.getWebhooks);
router.post('/', validateWebhook, webhookController.createWebhook);
router.put('/:id', validateWebhook, webhookController.updateWebhook);
router.delete('/:id', webhookController.deleteWebhook);

export default router;
