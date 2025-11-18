import { PrismaClient } from '@prisma/client';
import { LoggerMiddleware } from '@shared/src/middleware/logger.middleware';
import { NextFunction, Request, Response } from 'express';
import { createAsset } from '../services/asset.util';
import * as permissionService from '../services/permission.service';

const prisma = new PrismaClient();

// Middleware: On POST, create an asset and attach assetId to req.body
export async function attachAssetOnCreate(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST') {
    const projectId = String(req.headers['x-project-id'] ?? '');
    const typeNameWithPath = req.headers['x-asset-type'] as string;
    const assetName: string = String(
      req.body.name ?? req.body.title ?? req.headers['x-asset-type'],
    );

    if (assetName && typeNameWithPath && projectId) {
      const assetId = await createAsset(assetName, typeNameWithPath, projectId);
      if (assetId) {
        req.body.assetId = assetId;
        // Also ensure permissions for admin (redundant if createAsset already does this, but safe)
        const adminUser = await prisma.user.findFirst({ where: { name: 'Admin', projectId } });
        const finalOwnerId = adminUser ? adminUser.id : 'admin';
        const actions = ['edit', 'view', 'comment', 'delete'];
        LoggerMiddleware.debug('Ensuring permissions for asset', {
          assetId,
          finalOwnerId,
        });
        const permissionData = actions.map((type) => ({
          id: `${type}:asset:${assetId}:${finalOwnerId}`,
          type,
          resource: `asset:${assetId}`,
          assetId: assetId,
          userId: finalOwnerId,
          projectId,
          status: 1,
        }));
        // Use permissionService to create permissions
        await permissionService.createManyPermissions(permissionData);
        LoggerMiddleware.info('Permission created for asset', { assetId, finalOwnerId });
        // No direct return here, let controller/middleware handle response
      }

      // Override res.json to always include assetId if present
      const oldJson = res.json;
      res.json = function (body: any) {
        if (req.body.assetId && body && typeof body === 'object' && !('assetId' in body)) {
          if (body.data && typeof body.data === 'object') {
            body.data.assetId = req.body.assetId;
          } else {
            body.data = { ...(body.data || {}), assetId: req.body.assetId };
          }
        }
        return oldJson.call(this, body);
      };
    }
  }

  next();
}

// Middleware: On PATCH/PUT, add a history entry after update
export async function addHistoryOnUpdate(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'PATCH' || req.method === 'PUT') {
    // Wait for the controller to finish
    res.on('finish', async () => {
      const projectId: string = String(req.headers['x-project-id'] ?? '');
      if (projectId) {
        const project = await prisma.project.findFirst({ where: { id: projectId } });
        if (project) {
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const history = await prisma.history.create({
            data: {
              id: `${projectId}:${timestamp}:${randomSuffix}`,
              type: 'asset',
              action: 'update',
              payload: req.body,
              date: new Date(),
              timestamp: timestamp.toString(),
              user: 'system',
              status: 1,
              projectId: projectId,
            },
          });
          LoggerMiddleware.info('Updated history entry created: %o', history);
          if (!res.headersSent) {
            res.setHeader('x-history-id', history.id);
          }
        }
      }
    });
  }
  next();
}
