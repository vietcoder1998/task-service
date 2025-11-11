import { Prisma, PrismaClient } from '@prisma/client';
import { LinkedItem } from '@/types';
const prisma = new PrismaClient();

export const getLinkedItems = async (projectId?: string) => {
  if (projectId) {
    const items = await prisma.linkedItem.findMany({ where: { projectId: projectId } });
    return items.map((item: LinkedItem) => ({
      ...item,
      description: item.description ?? null,
      status: item.status ?? null,
      assetId: item.assetId ?? null,
    }));
  }
  const items = await prisma.linkedItem.findMany();
  return items.map((item: LinkedItem) => ({
    ...item,
    description: item.description ?? null,
    status: item.status ?? null,
    assetId: item.assetId ?? null,
  }));
};
export const createLinkedItem = async (linkedItem: LinkedItem) => {
  // Create asset and link

  // Ensure projectId is set
  if (!linkedItem.projectId) throw new Error('projectId required');
  let position = linkedItem.position;
  if (position == null && linkedItem.projectId) {
    const max = await prisma.linkedItem.aggregate({
      where: { projectId: linkedItem.projectId },
      _max: { position: true },
    });
    position = (max._max?.position ?? 0) + 1;
  }
  const item = await prisma.linkedItem.create({
    data: { ...linkedItem, position },
  });
  return {
    ...item,
    description: item.description ?? null,
    status: item.status ?? null,
    assetId: item.assetId ?? null,
  };
};
export const updateLinkedItem = async (id: string, updates: Partial<LinkedItem>) => {
  try {
    // Remove projectId from updates to satisfy Prisma's type requirements
    const { projectId, ...restUpdates } = updates;
    const item = await prisma.linkedItem.update({ where: { id }, data: restUpdates });
    return {
      ...item,
      description: item.description ?? null,
      assetId: item.assetId ?? null,
    };
  } catch {
    return null;
  }
};
export const deleteLinkedItem = async (id: string) => {
  try {
    await prisma.linkedItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
