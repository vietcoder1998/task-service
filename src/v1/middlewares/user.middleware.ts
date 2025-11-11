import { Request, Response, NextFunction } from 'express';

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;
  if (!name || typeof name !== 'string' || !email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Name and email are required and must be strings.' });
  }
  next();
};
