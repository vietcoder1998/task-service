import { Request, Response, NextFunction } from 'express';

export const validateFile = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'File id is required and must be a string.' });
  }
  next();
};
