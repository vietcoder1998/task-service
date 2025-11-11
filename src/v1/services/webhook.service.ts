const { v4: uuidv4 } = require('uuid');
import { Webhook as WebhookType } from '../../types';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const fromPrismaWebhook = (prismaWebhook: any): WebhookType => ({
  id: prismaWebhook.id,
  name: prismaWebhook.name,
  platform: prismaWebhook.platform,
  token: prismaWebhook.token ?? null,
  chatId: prismaWebhook.chatId ?? null,
  webhookUrl: prismaWebhook.webhookUrl ?? null,
  enabled: prismaWebhook.enabled,
  projectId: prismaWebhook.projectId,
  status: prismaWebhook.status,
});

export const getWebhooks = async (projectId?: string) => {
  if (projectId) {
    const webhooks = await prisma.webhook.findMany({ where: { projectId } });
    return webhooks.map(fromPrismaWebhook);
  }
  const webhooks = await prisma.webhook.findMany();
  return webhooks.map(fromPrismaWebhook);
};

export const createWebhook = async (webhook: WebhookType) => {
  const created = await prisma.webhook.create({
    data: {
      ...webhook,
      id: webhook.id || uuidv4(), // Ensure UUID is set
      status: webhook.status ?? 1,
    },
  });
  return fromPrismaWebhook(created);
};

export const updateWebhook = async (id: string, updates: Partial<WebhookType>) => {
  try {
    const updateData: any = { ...updates };
    if ('status' in updates) {
      updateData.status = updates.status ?? 1;
    }
    if (updateData.projectId === undefined) {
      delete updateData.projectId;
    }
    const updated = await prisma.webhook.update({ where: { id }, data: updateData });
    return fromPrismaWebhook(updated);
  } catch {
    return null;
  }
};

export const deleteWebhook = async (id: string) => {
  try {
    await prisma.webhook.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
