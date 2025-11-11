import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { Notification } from '../../types';

const prisma = new PrismaClient();

const fromPrismaNotification = (prismaNotification: any): Notification => ({
  id: prismaNotification.id,
  title: prismaNotification.title,
  message: prismaNotification.message,
  type: prismaNotification.type,
  data: prismaNotification.data ?? undefined,
  read: prismaNotification.read,
  createdAt: prismaNotification.createdAt,
  updatedAt: prismaNotification.updatedAt,
  projectId: prismaNotification.projectId,
  status: prismaNotification.status,
  position: prismaNotification.position ?? null,
});

export const getNotifications = async (
  projectId?: string,
  pageIndex: number = 0,
  pageSize: number = 20,
) => {
  const where = projectId ? { projectId, status: { gte: 0 } } : { status: { gte: 0 } };
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: pageIndex * pageSize,
    take: pageSize,
  });
  return notifications.map(fromPrismaNotification);
};

export const getNotificationById = async (id: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  return notification ? fromPrismaNotification(notification) : null;
};

export const createNotification = async (notification: Partial<Notification>) => {
  // Only allow fields that are valid for creation
  const { id, createdAt, updatedAt, ...data } = notification;
  if (!data.projectId) throw new Error('projectId is required');
  // Ensure data field is correct type
  const createData: Prisma.NotificationCreateInput = {
    title: data.title ?? '',
    message: data.message ?? '',
    type: data.type ?? 'info',
    data: (data.data as Prisma.JsonValue) ?? undefined,
    read: data.read ?? false,
    status: data.status ?? 1,
    project: { connect: { id: data.projectId } },
  };
  const created = await prisma.notification.create({
    data: createData,
  });
  return fromPrismaNotification(created);
};

export const updateNotification = async (id: string, updates: Partial<Notification>) => {
  try {
    // Only allow updatable fields
    const { id: _id, createdAt, updatedAt, projectId, ...data } = updates;
    // Ensure data field is correct type
    const updateData: Prisma.NotificationUpdateInput = {
      title: data.title,
      message: data.message,
      type: data.type,
      data: (data.data as Prisma.JsonValue) ?? undefined,
      read: data.read,
      status: data.status ?? undefined,
    };
    const updated = await prisma.notification.update({ where: { id }, data: updateData });
    return fromPrismaNotification(updated);
  } catch {
    return null;
  }
};

export const deleteNotification = async (id: string) => {
  // Soft delete: set status = -1
  try {
    const deleted = await prisma.notification.update({ where: { id }, data: { status: -1 } });
    return fromPrismaNotification(deleted);
  } catch {
    return null;
  }
};
