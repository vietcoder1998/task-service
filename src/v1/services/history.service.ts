import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getHistories = async (projectId?: string) => {
  if (projectId) {
    return prisma.history.findMany({ where: { projectId } });
  }
  return prisma.history.findMany();
};

export const createHistory = async (history: any) => {
  return prisma.history.create({ data: history });
};

export const updateHistory = async (id: string, updates: any) => {
  try {
    return await prisma.history.update({ where: { id }, data: updates });
  } catch {
    return null;
  }
};

export const deleteHistory = async (id: string) => {
  try {
    await prisma.history.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
