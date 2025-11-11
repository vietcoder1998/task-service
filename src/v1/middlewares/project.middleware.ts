import { Request, Response, NextFunction } from 'express';

// Example: Validate project data before create/update
export const validateProject = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!req.body.id) {
    req.body.id = Math.random().toString(36).substring(2, 15);
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Project name is required and must be a string.' });
  }
  next();
};
