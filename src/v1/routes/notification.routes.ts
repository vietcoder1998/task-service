import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationById);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.patch('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

export default router;
