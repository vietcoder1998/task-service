import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRole = async (name: string, projectId: string) => {
  return prisma.role.create({ data: { name, projectId } });
};

export const getRolesByProject = async (projectId: string) => {
  return prisma.role.findMany({ where: { projectId } });
};

export const updateRole = async (id: string, data: Partial<{ name: string; status: number }>) => {
  return prisma.role.update({ where: { id }, data });
};

export const deleteRole = async (id: string) => {
  return prisma.role.delete({ where: { id } });
};
