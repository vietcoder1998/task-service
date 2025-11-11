import { Request, Response, NextFunction } from 'express';

export const validateWebhook = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method.toLowerCase();
  // Only require id for PUT or PATCH methods
  if (method === 'put' || method === 'patch') {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Webhook id is required and must be a string.' });
    }
  }
  next();
};
