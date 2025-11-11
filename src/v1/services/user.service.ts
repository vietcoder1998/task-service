import { User } from '@/types';
import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();

export const getUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const getUsersByProject = async (
  projectId: string,
  pageIndex?: number,
  pageSize?: number,
  q?: string,
): Promise<User[]> => {
  const where: any = { projectId };
  if (q) {
    where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
  }
  return prisma.user.findMany({
    where,
    skip: pageIndex && pageSize ? pageIndex * pageSize : undefined,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
};

export const createUser = async (data: any): Promise<User> => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: string, data: any): Promise<User> => {
  return prisma.user.update({ where: { id: id }, data });
};

export const deleteUser = async (id: string): Promise<void> => {
  await prisma.user.delete({ where: { id: id } });
};

export async function searchUsers(query: string, pageIndex = 0, pageSize = 20) {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ name: { contains: query } }, { email: { contains: query } }],
    },
    skip: pageIndex * pageSize,
    take: pageSize,
  });
  return users;
}
