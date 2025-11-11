import { Request, Response } from 'express';
import * as ganttTaskService from '../services/ganttTask.service';
import logger from '../../logger';

export const getGanttTaskById = async (req: Request, res: Response) => {
  try {
    const task = await ganttTaskService.getGanttTaskById(req.params.id);
    if (task) {
      logger.info('Fetched gantt task by id: %s', req.params.id);
      return res.json(task);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('Failed to fetch gantt task by id: %s', e?.message || e);
    res.status(500).json({ error: 'Failed to fetch gantt task', details: e?.message || String(e) });
  }
};

export const getGanttTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const tasks = await ganttTaskService.getGanttTasks(projectId);
    logger.info('Fetched gantt tasks by projectId: %s', projectId);
    res.json(tasks);
  } catch (e: any) {
    logger.error('Failed to fetch gantt tasks by projectId: %s', e?.message || e);
    res.status(500).json({
      error: 'Failed to fetch gantt tasks by projectId',
      details: e?.message || String(e),
    });
  }
};

export const getGanttTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const tasks = await ganttTaskService.getGanttTasks(
      typeof projectId === 'string' ? projectId : undefined,
    );
    logger.info('Fetched gantt tasks');
    res.json(tasks);
  } catch (e: any) {
    logger.error('Failed to fetch gantt tasks: %s', e?.message || e);
    res
      .status(500)
      .json({ error: 'Failed to fetch gantt tasks', details: e?.message || String(e) });
  }
};

export const createGanttTask = async (req: Request, res: Response) => {
  try {
    const task = await ganttTaskService.createGanttTask(req.body);
    logger.info('Created gantt task: %o', task);
    res.status(201).json(task);
  } catch (e: any) {
    logger.error('GanttTask creation failed: %s', e?.message || e);
    res.status(400).json({ error: 'GanttTask creation failed', details: e?.message || String(e) });
  }
};

export const updateGanttTask = async (req: Request, res: Response) => {
  try {
    const task = await ganttTaskService.updateGanttTask(req.params.id, req.body);
    if (task) {
      logger.info('Updated gantt task: %o', task);
      return res.json(task);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('GanttTask update failed: %s', e?.message || e);
    res.status(400).json({ error: 'GanttTask update failed', details: e?.message || String(e) });
  }
};

export const deleteGanttTask = async (req: Request, res: Response) => {
  try {
    const ok = await ganttTaskService.deleteGanttTask(req.params.id);
    if (ok) {
      logger.info('Deleted gantt task: %s', req.params.id);
      return res.status(204).end();
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('GanttTask deletion failed: %s', e?.message || e);
    res.status(400).json({ error: 'GanttTask deletion failed', details: e?.message || String(e) });
  }
};

export const swapGanttTaskPosition = async (req: Request, res: Response) => {
  try {
    const { id1, id2 } = req.body;
    if (!id1 || !id2) return res.status(400).json({ error: 'Missing id1 or id2' });
    await ganttTaskService.swapGanttTaskPosition(id1, id2);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
