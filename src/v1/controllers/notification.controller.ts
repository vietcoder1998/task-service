import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const { projectId } = req.query;
  const notifications = await notificationService.getNotifications(projectId as string | undefined);
  res.json(notifications);
};

export const getNotificationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await notificationService.getNotificationById(id);
  if (notification) {
    res.json(notification);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json(notification);
};

export const updateNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await notificationService.updateNotification(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await notificationService.deleteNotification(id);
  if (deleted) {
    res.json(deleted);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
};
