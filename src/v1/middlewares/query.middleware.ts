import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to parse and normalize query params: q (search), pageIndex, pageSize
 * Adds req._parsedQuery = { q, pageIndex, pageSize }
 */
export function parseQueryParams(req: Request, res: Response, next: NextFunction) {
  // Normalize search query
  let q: string | undefined = undefined;
  if (typeof req.query.q === 'string') {
    q = req.query.q.trim();
  }

  // Normalize pageIndex
  let pageIndex = 0;
  if (typeof req.query.pageIndex === 'string') {
    const idx = parseInt(req.query.pageIndex, 10);
    if (!isNaN(idx) && idx >= 0) pageIndex = idx;
  }

  // Normalize pageSize
  let pageSize = 20;
  if (typeof req.query.pageSize === 'string') {
    const size = parseInt(req.query.pageSize, 10);
    if (!isNaN(size) && size > 0) pageSize = size;
  }

  // Attach to request for downstream use
  (req as any)._parsedQuery = { q, pageIndex, pageSize };
  next();
}
