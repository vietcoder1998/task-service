import { Request, Response, NextFunction } from 'express';

export const validateLinkedItem = (req: Request, res: Response, next: NextFunction) => {
  // Always validate for POST and PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    const { id } = req.body || {};
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'LinkedItem id is required and must be a string.' });
    }
    return next();
  }
  // For other methods, if req.body is present, always validate id
  if (req.body) {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'LinkedItem id is required and must be a string.' });
    }
  }
  next();
};
