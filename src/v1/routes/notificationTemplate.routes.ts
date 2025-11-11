import { Router } from 'express';
import * as notificationControllerTemplate from '../controllers/notificationTemplate.controller';

const router = Router();

router.get('/', notificationControllerTemplate.getNotificationTemplates);
router.get('/:id', notificationControllerTemplate.getNotificationTemplateById);
router.post('/', notificationControllerTemplate.createNotificationTemplate);
router.put('/:id', notificationControllerTemplate.updateNotificationTemplate);
router.patch('/:id', notificationControllerTemplate.updateNotificationTemplate);
router.delete('/:id', notificationControllerTemplate.deleteNotificationTemplate);

export default router;
