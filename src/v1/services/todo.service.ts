import type { Todo } from '@/types';
import { PrismaClient } from '@prisma/client';
import logger from '../../logger';
import { publishTodoEvent } from '../../queue';

const prisma = new PrismaClient();

// Utility: Convert app Todo type to Prisma create/update input
const toPrismaTodoInput = (todo: Omit<Todo, 'id'> & { id?: string }): any => ({
  ...todo,
  startDate: todo.startDate ?? null,
  endDate: todo.endDate ?? null,
  status: todo.status ?? null,
  label: todo.label ?? null,
  // Relations: pass arrays directly, handled in create/update logic
  relatedTasks: todo.relatedTasks,
  assignedUsers: todo.assignedUsers,
  todoFiles: todo.todoFiles,
  todoWebhooks: todo.todoWebhooks,
  todoGanttTasks: todo.todoGanttTasks,
  todoLinkedItems: todo.todoLinkedItems,
  todoHistories: todo.todoHistories,
});

// Utility: Convert Prisma Todo to app Todo type
const fromPrismaTodo = (prismaTodo: any): Todo => ({
  ...prismaTodo,
  label: prismaTodo.label as 'todo' | 'in-progress' | 'review' | 'done',
  relatedTasks: prismaTodo.relatedTasks ?? [],
  assignedUsers: prismaTodo.assignedUsers ?? [],
  todoFiles: prismaTodo.todoFiles ?? [],
  todoWebhooks: prismaTodo.todoWebhooks ?? [],
  todoGanttTasks: prismaTodo.todoGanttTasks ?? [],
  todoLinkedItems: prismaTodo.todoLinkedItems ?? [],
  todoHistories: prismaTodo.todoHistories ?? [],
  deadline: prismaTodo.deadline ?? null,
  startDate: prismaTodo.startDate ?? null,
  endDate: prismaTodo.endDate ?? null,
  status: prismaTodo.status ?? 1,
});

export const getTodos = async (projectId?: string): Promise<Todo[]> => {
  const todos = await prisma.todo.findMany({
    ...(projectId ? { where: { projectId } } : {}),
    include: {
      relatedTasks: true,
      assignedUsers: true,
      todoFiles: true,
      todoWebhooks: true,
      todoGanttTasks: true,
      todoLinkedItems: true,
      todoHistories: true,
      project: true,
      asset: true,
      report: true,
      location: true,
    },
  });
  return todos.map(fromPrismaTodo);
};

export const createTodo = async (todo: Omit<Todo, 'id'> & { id?: string }): Promise<Todo> => {
  // Create asset and link
  let assetId: string | null = null;
  // Convert status to int if string
  let status: number = 1;
  if (typeof todo.status === 'string') {
    switch (todo.status) {
      case 'todo':
        status = 1;
        break;
      case 'in-progress':
        status = 2;
        break;
      case 'review':
        status = 3;
        break;
      case 'done':
        status = 4;
        break;
      default:
        status = 1;
    }
  } else if (typeof todo.status === 'number') {
    status = todo.status;
  }
  // Prisma expects relation connects, not direct ids
  const { projectId, assetId: _assetId, ...rest } = toPrismaTodoInput(todo);
  let position = todo.position;
  if (position == null && todo.projectId) {
    const max = await prisma.todo.aggregate({
      where: { projectId: todo.projectId },
      _max: { position: true },
    });
    position = (max._max?.position ?? 0) + 1;
  }
  // Build relation data
  const data: any = {
    id: todo.id, // <-- Fix: add id if provided
    title: todo.title,
    description: todo.description,
    date: todo.date,
    deadline: todo.deadline,
    label: todo.label ?? 'todo', // <-- Fix: always provide label
    createdAt: todo.createdAt || new Date().toISOString(),
    updatedAt: todo.updatedAt || new Date().toISOString(),
    project: { connect: { id: todo.projectId } },
    asset: todo.assetId ? { connect: { id: todo.assetId } } : undefined,
    report: todo.reportId ? { connect: { id: todo.reportId } } : undefined,
    status: status,
    position: position,
    startDate: todo.startDate,
    endDate: todo.endDate,
    // Relations
    relatedTasks: todo.relatedTasks?.length
      ? {
          create: todo.relatedTasks.map((rt) => ({
            relatedId: rt.relatedId,
            status: rt.status ?? 1,
          })),
        }
      : undefined,
    assignedUsers: todo.assignedUsers?.length
      ? { create: todo.assignedUsers.map((au) => ({ userId: au.userId, status: au.status ?? 1 })) }
      : undefined,
    todoFiles: todo.todoFiles?.length
      ? { create: todo.todoFiles.map((tf) => ({ fileId: tf.fileId, status: tf.status ?? 1 })) }
      : undefined,
    todoWebhooks: todo.todoWebhooks?.length
      ? {
          create: todo.todoWebhooks.map((tw) => ({
            webhookId: tw.webhookId,
            status: tw.status ?? 1,
          })),
        }
      : undefined,
    todoGanttTasks: todo.todoGanttTasks?.length
      ? {
          create: todo.todoGanttTasks.map((gt) => ({
            ganttTaskId: gt.ganttTaskId,
            status: gt.status ?? 1,
          })),
        }
      : undefined,
    todoLinkedItems: todo.todoLinkedItems?.length
      ? {
          create: todo.todoLinkedItems.map((li) => ({
            linkedItemId: li.linkedItemId,
            status: li.status ?? 1,
          })),
        }
      : undefined,
    todoHistories: todo.todoHistories?.length
      ? {
          create: todo.todoHistories.map((th) => ({
            historyId: th.historyId,
            status: th.status ?? 1,
          })),
        }
      : undefined,
  };

  const created = await prisma.todo.create({ data });
  // Fetch with relations
  const detail = await getTodoDetail(created.id);
  if (!detail) throw new Error('Created todo not found');
  return detail;
};

export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo | null> => {
  try {
    // Build update data, only include defined fields
    const updateData: any = {};
    logger.debug('Updating todo %s with data: %o', id, updates);
    for (const key in updates) {
      const value = (updates as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: updateData,
    });

    await publishTodoEvent({ type: 'todo', projectId: updated.projectId, updated });

    return fromPrismaTodo(updated);
  } catch (err) {
    logger.error('Failed to update todo: %s', err);
    return null;
  }
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    await prisma.todo.delete({ where: { id } });
    return true;
  } catch (err) {
    logger.error(
      'Failed to delete todo: %s',
      typeof err === 'object' && err !== null && 'message' in err
        ? (err as any).message
        : JSON.stringify(err),
    );
    return false;
  }
};

export const getTodoDetail = async (id: string): Promise<Todo | null> => {
  const todo = await prisma.todo.findUnique({
    where: { id },
    include: {
      relatedTasks: true,
      assignedUsers: true,
      todoFiles: true,
      todoWebhooks: true,
      todoGanttTasks: true,
      todoLinkedItems: true,
      todoHistories: true,
    },
  });
  if (!todo) return null;
  // Ensure status is always a number
  return {
    ...todo,
    status: typeof todo.status === 'number' ? todo.status : 1,
  };
};

export const swapTodoPosition = async (id1: string, id2: string): Promise<void> => {
  const todo1 = await prisma.todo.findUnique({ where: { id: id1 } });
  const todo2 = await prisma.todo.findUnique({ where: { id: id2 } });
  if (!todo1 || !todo2) throw new Error('Todo not found');
  await prisma.todo.update({ where: { id: id1 }, data: { position: todo2.position } });
  await prisma.todo.update({ where: { id: id2 }, data: { position: todo1.position } });
};
