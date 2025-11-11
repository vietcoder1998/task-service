import { publishNotificationEvent } from '../../queue';
import { generateNotificationFromTemplate } from '../services/notificationTemplate.service';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { NotificationResourceType } from '../../enum';
const prisma = new PrismaClient();

/**
 * Middleware to create a notification on POST, PATCH, PUT requests.
 * Expects req.body.projectId to be present.
 */
export async function createNotificationOnChange(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toLowerCase();
  if (['post', 'put', 'patch'].includes(method)) {
    const { projectId } = req.body ?? req.params;
    if (projectId) {
      try {
        // Determine resource type using switch-case
        let resourceType: NotificationResourceType = NotificationResourceType.Resource;
        switch (true) {
          case req.url.includes('todo'):
            resourceType = NotificationResourceType.Todo;
            break;
          case req.url.includes('gantt'):
            resourceType = NotificationResourceType.GanttTask;
            break;
          case req.url.includes('history'):
            resourceType = NotificationResourceType.History;
            break;
          case req.url.includes('permission'):
            resourceType = NotificationResourceType.Permission;
            break;
          case req.url.includes('file'):
            resourceType = NotificationResourceType.File;
            break;
          case req.url.includes('asset'):
            resourceType = NotificationResourceType.Asset;
            break;
          case req.url.includes('user'):
            resourceType = NotificationResourceType.User;
            break;
          case req.url.includes('location'):
            resourceType = NotificationResourceType.Location;
            break;
          case req.url.includes('webhook'):
            resourceType = NotificationResourceType.Webhook;
            break;
          case req.url.includes('linked-item'):
            resourceType = NotificationResourceType.LinkedItem;
            break;
        }
        // Get userId if present
        const userId = req.body.userId || 'unknown';
        // Generate notification content from template
        let generated;
        try {
          generated = await generateNotificationFromTemplate(
            resourceType,
            {
              ...req.body,
              userId,
              method: method.toUpperCase(),
              projectId,
            },
            projectId,
          );
        } catch (err) {
          // fallback to default if no template found
          generated = {
            subject: `Project ${projectId} ${resourceType} ${method.toUpperCase()} change`,
            body: `A ${method.toUpperCase()} operation was performed on ${resourceType} by user ${userId}.\nRequest body: ${JSON.stringify(req.body)}`,
            type: resourceType,
          };
        }
        const notification = await prisma.notification.create({
          data: {
            projectId,
            title: generated.subject,
            message: generated.body,
            type: generated.type || resourceType,
            data: req.body,
            templateId: generated.templateId || undefined,
          },
        });
        // Publish to RabbitMQ for socket event
        try {
          await publishNotificationEvent({
            type: 'notification',
            projectId,
            notification,
          });
        } catch (err) {
          // Optionally log error
        }
      } catch (err) {
        // Optionally log error, but don't block the request
        // console.error('Failed to create notification:', err);
      }
    }
  }
  next();
}
