import { Request, Response, NextFunction } from 'express';
import logger from '../../logger';
import redisClient from '../../utils/redisClient';

// Extend Express Request to allow meta property
declare module 'express-serve-static-core' {
  interface Request {
    meta?: {
      query: Record<string, any>;
      params: Record<string, any>;
      page: number;
      pageSize: number;
      q: string;
      [key: string]: any;
    };
  }
}

/**
 * Middleware to wrap all responses in a boundary format: { data, message }
 * Usage: Place after all routes, before error handler.
 */
export function boundaryResponse(req: Request, res: Response, next: NextFunction) {
  // Helper to get cache key with project context
  const getCacheKey = () => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const projectId = req.headers['x-project-id'] || req.params.projectId || req.body.projectId;

    // Include project ID in cache key for better organization
    const baseKey = `cache:${ip}:${req.method}:${req.originalUrl}`;
    return projectId ? `${baseKey}:project:${projectId}` : baseKey;
  };

  // For update methods: invalidate cache for all users in the same project
  if (['PUT', 'PATCH', 'DELETE', 'POST'].includes(req.method)) {
    const projectId = req.headers['x-project-id'] || req.params.projectId || req.body.projectId;
    const resourceId = req.params.id || req.body.id;

    // Build cache invalidation patterns
    const patterns: string[] = [];

    if (projectId) {
      // Invalidate all GET requests for this project (all users)
      patterns.push(`cache:*:GET:*${projectId}*`);
    }

    if (resourceId) {
      // Invalidate all GET requests for this specific resource (all users)
      patterns.push(`cache:*:GET:*${resourceId}*`);
    }

    // Execute cache invalidation for all patterns
    patterns.forEach(async (pattern) => {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          logger.info(`Cache invalidated for pattern ${pattern} (${keys.length} keys cleared)`);
        }
      } catch (error) {
        logger.error(`Failed to invalidate cache for pattern ${pattern}:`, error);
      }
    });
  }

  // If x-project-id header is present, add projectId to req.params
  const projectIdHeader = req.headers['x-project-id'];

  if (projectIdHeader) {
    req.params = { ...req.params, projectId: String(projectIdHeader) };
    req.body = { ...req.body, projectId: String(projectIdHeader) };
  }

  // Mock all query and params into req.meta
  req.meta = {
    ...req.meta,
    query: { ...req.query },
    params: { ...req.params },
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
    q: typeof req.query.q === 'string' ? req.query.q : '',
  };

  // Unified response handler with caching support
  const oldJson = res.json;
  res.json = function (body: any) {
    // Handle caching for GET requests
    if (req.method === 'GET') {
      const cacheKey = getCacheKey();

      // Check if this is a cached response being served
      const isCacheHit = res.getHeader('X-Cache') === 'HIT';

      if (!isCacheHit) {
        // This is a fresh response, cache it if successful
        if (res.statusCode === 200) {
          const responseToCache = formatResponse(body);
          redisClient.set(cacheKey, JSON.stringify(responseToCache), { EX: 86400 }); // 1 day expiry
        }
        res.setHeader('X-Cache', 'MISS');
      }
    }

    return oldJson.call(this, formatResponse(body));
  };

  // Helper function to format response consistently
  function formatResponse(body: any) {
    // If already in boundary format, don't double-wrap
    if (body && typeof body === 'object' && 'data' in body && 'message' in body) {
      return body;
    }

    // If body is an error or string, treat as message
    if (body instanceof Error || (body && body.error)) {
      // If error object, try to extract code and errorCode
      const code = body.code || 500;
      const errorCode = body.errorCode || body.code || -1;
      const message = body.message || body.error || String(body);
      const details = body.details || undefined;
      logger.error(
        [
          'API Error:',
          `message: ${message}`,
          `path: ${req.url}`,
          `method: ${req.method}`,
          'body:',
          formatTable(req.body),
          'headers:',
          formatTable(req.headers),
          'calledDetail:',
          formatTable(req.meta),
          details ? `details:\n${formatTable(details)}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      );
      return { data: null, message, code, errorCode, details };
    }

    if (typeof body === 'string') {
      logger.info(
        [
          'API Success:',
          `message: ${body}`,
          `path: ${req.url}`,
          `method: ${req.method}`,
          'body:',
          formatTable(req.body),
          'headers:',
          formatTable(req.headers),
          'calledDetail:',
          formatTable(req.meta),
        ].join('\n'),
      );
      return { data: null, message: String(body) };
    }

    // If data is an array, add total, page, pageSize
    if (Array.isArray(body)) {
      const page = req.meta?.page ?? 1;
      const pageSize = req.meta?.pageSize ?? 10;
      logger.info(
        [
          'API Success:',
          `message: Success`,
          `path: ${req.url}`,
          `method: ${req.method}`,
          'body:',
          formatTable(req.body),
          'headers:',
          formatTable(req.headers),
          'calledDetail:',
          formatTable(req.meta),
        ].join('\n'),
      );
      return {
        data: body,
        total: body.length,
        page,
        pageSize,
        message: 'Success',
      };
    }

    // Default: wrap in { data, message }
    logger.info(
      [
        'API Success:',
        `message: Success`,
        `path: ${req.url}`,
        `method: ${req.method}`,
        'body:',
        formatTable(req.body),
        'headers:',
        formatTable(req.headers),
        'calledDetail:',
        formatTable(req.meta),
      ].join('\n'),
    );
    return { data: body, message: 'Success' };
  }

  // For GET: try to serve from cache first
  if (req.method === 'GET') {
    const cacheKey = getCacheKey();
    redisClient.get(cacheKey).then((cached) => {
      if (cached) {
        logger.info(`Cache hit for ${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      } else {
        logger.info(`Cache miss for ${cacheKey}`);
        next();
      }
    });
    return;
  }

  next();
}

// Helper to format objects as a table-like string for logging
function formatTable(obj: any): string {
  if (!obj || typeof obj !== 'object') return '';
  const entries = Object.entries(obj);
  if (entries.length === 0) return '';
  const header = '| Key           | Value         |\n|---------------|---------------|';
  const rows = entries
    .map(([key, value]) => {
      const val =
        typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
      return `| ${key.padEnd(13)} | ${val.padEnd(13)} |`;
    })
    .join('\n');
  return `${header}\n${rows}`;
}
