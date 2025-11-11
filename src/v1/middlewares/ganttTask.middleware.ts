import { NextFunction, Request, Response } from 'express';

export const validateGanttTask = (req: Request, res: Response, next: NextFunction) => {
  const { id, color, startDate, endDate, name, projectId } = req.body;

  // Require id for non-POST methods only
  if (req.method !== 'POST') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'GanttTask id is required and must be a string.' });
    }
  }
  // For POST, do not require id, but if present, it must be a string
  if (req.method === 'POST' && id && typeof id !== 'string') {
    return res.status(400).json({ error: 'GanttTask id must be a string if provided.' });
  }

  // Only check required fields for POST
  if (req.method === 'POST') {
    if (!color || typeof color !== 'string') {
      return res.status(400).json({ error: 'GanttTask color is required and must be a string.' });
    }
    if (
      !startDate ||
      (typeof startDate !== 'string' &&
        typeof startDate !== 'number' &&
        !(startDate instanceof Date))
    ) {
      return res
        .status(400)
        .json({ error: 'GanttTask start is required and must be a string, number, or Date.' });
    }
    if (
      !endDate ||
      (typeof endDate !== 'string' && typeof endDate !== 'number' && !(endDate instanceof Date))
    ) {
      return res
        .status(400)
        .json({ error: 'GanttTask end is required and must be a string, number, or Date.' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'GanttTask name is required and must be a string.' });
    }
    if (!projectId || typeof projectId !== 'string') {
      return res
        .status(400)
        .json({ error: 'GanttTask projectId is required and must be a string.' });
    }
  }

  next();
};
