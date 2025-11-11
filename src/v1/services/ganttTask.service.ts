import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GanttTask as GanttTaskType } from '../../types';
const prisma = new PrismaClient();

const fromPrismaGanttTask = (prismaTask: GanttTaskType): GanttTaskType => ({
  id: prismaTask.id,
  name: prismaTask.name ?? null,
  startDate: prismaTask.startDate ?? null,
  endDate: prismaTask.endDate ?? null,
  color: prismaTask.color ?? null,
  projectId: prismaTask.projectId,
  assetId: prismaTask.assetId ?? null,
  createdAt: prismaTask.createdAt,
  updatedAt: prismaTask.createdAt,
  position: prismaTask.position ?? 0,
  status: prismaTask.status ?? null,
  progress: prismaTask.progress ?? 0,
});

// Get only Gantt tasks by projectId
export const getOnlyGanttTasksByProjectId = async (projectId: string) => {
  const tasks = await prisma.ganttTask.findMany({
    where: { projectId },
    orderBy: { position: 'asc' },
  });
  return tasks.map(fromPrismaGanttTask);
};

export const getGanttTasks = async (projectId?: string) => {
  if (projectId) {
    const tasks = await prisma.ganttTask.findMany({ where: { projectId } });
    return tasks.map(fromPrismaGanttTask);
  }
  const tasks = await prisma.ganttTask.findMany();
  return tasks.map(fromPrismaGanttTask);
};

export const getGanttTaskById = async (id: string) => {
  const task = await prisma.ganttTask.findUnique({ where: { id } });
  return task ? fromPrismaGanttTask(task) : null;
};

export const createGanttTask = async (task: GanttTaskType) => {
  const { projectId, color, ...rest } = task as GanttTaskType;

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error('Project not found');
  }

  let position = task.position;
  if (position == null && projectId) {
    const max = await prisma.ganttTask.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    position = (max._max?.position ?? 0) + 1;
  }

  // Create asset and link
  let assetId: string | null = null;

  const data = {
    ...rest,
    id: randomUUID(),
    startDate: rest.startDate,
    endDate: rest.endDate,
    color: color || 'bg-blue-500',
    assetId,
    projectId,
    position,
    status: rest.status === null ? undefined : rest.status,
  };
  const created = await prisma.ganttTask.create({ data });
  return fromPrismaGanttTask(created);
};

export const updateGanttTask = async (id: string, updates: Partial<GanttTaskType>) => {
  try {
    // Remove projectId if it's undefined to satisfy Prisma's type requirements
    const { projectId, assetId, ...rest } = updates;
    const data: any = projectId === undefined ? rest : { ...rest, projectId };

    // Only include assetId if it is not undefined
    if (assetId !== undefined) {
      data.assetId = assetId;
    }

    const updated = await prisma.ganttTask.update({ where: { id }, data });
    return fromPrismaGanttTask(updated);
  } catch {
    return null;
  }
};

export const deleteGanttTask = async (id: string) => {
  try {
    await prisma.ganttTask.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};

export const swapGanttTaskPosition = async (id1: string, id2: string) => {
  const task1 = await prisma.ganttTask.findUnique({ where: { id: id1 } });
  const task2 = await prisma.ganttTask.findUnique({ where: { id: id2 } });
  if (!task1 || !task2) throw new Error('Task not found');
  // Swap positions
  await prisma.ganttTask.update({ where: { id: id1 }, data: { position: task2.position } });
  await prisma.ganttTask.update({ where: { id: id2 }, data: { position: task1.position } });
  return true;
};
