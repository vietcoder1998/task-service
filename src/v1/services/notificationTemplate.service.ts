export async function getTemplatesByProjectId(projectId: string) {
  return prisma.notificationTemplate.findMany({ where: { projectId } });
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getNotificationTemplates(projectId?: string) {
  return prisma.notificationTemplate.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNotificationTemplateById(id: string) {
  return prisma.notificationTemplate.findUnique({ where: { id } });
}

export async function createNotificationTemplate(data: any) {
  return prisma.notificationTemplate.create({ data });
}

export async function updateNotificationTemplate(id: string, data: any) {
  return prisma.notificationTemplate.update({ where: { id }, data });
}

export async function deleteNotificationTemplate(id: string) {
  await prisma.notificationTemplate.delete({ where: { id } });
  return true;
}

// Generate notification from template type and payload
export async function generateNotificationFromTemplate(
  type: string,
  payload: Record<string, any>,
  projectId?: string,
) {
  // Fetch template by type (and projectId if provided)
  const template = await prisma.notificationTemplate.findFirst({
    where: {
      type,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!template) throw new Error('Notification template not found');

  // Helper to replace {{key}} in a string with payload[key]
  function replacePlaceholders(str: string) {
    return str.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
      payload[key] !== undefined ? String(payload[key]) : '',
    );
  }

  return {
    subject: replacePlaceholders(template.subject),
    body: replacePlaceholders(template.body),
    type: template.type,
    templateId: template.id,
  };
}
