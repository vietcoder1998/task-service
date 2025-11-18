import { Request, Response } from 'express';
import { LoggerMiddleware } from '@shared/src/middleware/logger.middleware';
import * as projectService from '../services/project.service';
import * as todoService from '../services/todo.service';
import { Todo } from '../../types/index';

export const getTodos = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const todos = await todoService.getTodos(typeof projectId === 'string' ? projectId : undefined);
    LoggerMiddleware.info('Fetched todos');
    res.json(todos);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch todos', details: e?.message || String(e) });
  }
};

export const getTodoByProjectId = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId parameter' });
    }
    const todos = await todoService.getTodos(projectId);
    LoggerMiddleware.info('Fetched todos for projectId %s', projectId);
    res.json(todos);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch todos', details: e?.message || String(e) });
  }
};

// end updateTodo
export const createTodo = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      status,
      createdAt,
      updatedAt,
      projectId,
      locationId,
      deadline,
      startDate,
      endDate,
      relatedTasks,
      assignedUsers,
      todoFiles,
      todoWebhooks,
      todoGanttTasks,
      todoLinkedItems,
      todoHistories,
    } = req.body;
    if (!title || !date || !status || !projectId) {
      return res.status(400).json({ error: 'Missing required todo fields' });
    }
    const todo: Todo = {
      id: req.body.id || String(Date.now()),
      title,
      description,
      date,
      status,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
      projectId,
      locationId,
      deadline,
      position: null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      // Relations
      relatedTasks: Array.isArray(relatedTasks) ? relatedTasks : [],
      assignedUsers: Array.isArray(assignedUsers) ? assignedUsers : [],
      todoFiles: Array.isArray(todoFiles) ? todoFiles : [],
      todoWebhooks: Array.isArray(todoWebhooks) ? todoWebhooks : [],
      todoGanttTasks: Array.isArray(todoGanttTasks) ? todoGanttTasks : [],
      todoLinkedItems: Array.isArray(todoLinkedItems) ? todoLinkedItems : [],
      todoHistories: Array.isArray(todoHistories) ? todoHistories : [],
    };
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      return res.status(400).json({ error: 'Project not found for given projectId' });
    }
    const created = await todoService.createTodo(todo);
    LoggerMiddleware.info('Created todo: %o', created);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: 'Todo creation failed', details: e?.message || String(e) });
  }
};
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.body);

    return res.json(todo);
  } catch (e: any) {
    res.status(400).json({ error: 'Todo update failed', details: e?.message || String(e) });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const ok = await todoService.deleteTodo(req.params.id);
    if (ok) {
      LoggerMiddleware.info('Deleted todo: %s', req.params.id);
      return res.status(204).end();
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    res.status(400).json({ error: 'Todo deletion failed', details: e?.message || String(e) });
  }
};

export const getTodoDetail = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.getTodoDetail(req.params.id);
    if (todo) {
      LoggerMiddleware.info('Fetched todo detail: %o', todo);
      return res.json(todo);
    }
    res.status(404).json({ error: 'Todo not found' });
  } catch (e: any) {
    LoggerMiddleware.error('Failed to fetch todo detail: %s', e?.message || e);
    res
      .status(500)
      .json({ error: 'Failed to fetch todo detail', details: e?.message || String(e) });
  }
};

export const swapTodoPosition = async (req: Request, res: Response) => {
  try {
    const { id1, id2 } = req.body;
    if (!id1 || !id2) return res.status(400).json({ error: 'Missing todo ids' });
    await todoService.swapTodoPosition(id1, id2);
    res.status(200).json({ success: true });
  } catch (e: any) {
    LoggerMiddleware.error('Swap todo position failed: %s', e?.message || e);
    res.status(400).json({ error: 'Swap todo position failed', details: e?.message || String(e) });
  }
};
