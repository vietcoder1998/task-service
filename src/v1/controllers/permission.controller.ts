import { Request, Response } from 'express';
import logger from '../../logger';
import * as permissionService from '../services/permission.service';

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const permissions = await permissionService.getPermissions(projectId, pageIndex, pageSize, q);
    logger.info('Fetched permissions', projectId);
    res.json(permissions);
  } catch (e: any) {
    logger.error('Failed to fetch permissions: %s', e?.message || e);
    res
      .status(500)
      .json({ error: 'Failed to fetch permissions', details: e?.message || String(e) });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    logger.info('Created permission: %o', permission);
    res.status(201).json(permission);
  } catch (e: any) {
    logger.error('Permission creation failed: %s', e?.message || e);
    res.status(400).json({ error: 'Permission creation failed', details: e?.message || String(e) });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.updatePermission(req.params.id, req.body);
    if (permission) {
      logger.info('Updated permission: %o', permission);
      return res.json(permission);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('Permission update failed: %s', e?.message || e);
    res.status(400).json({ error: 'Permission update failed', details: e?.message || String(e) });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const ok = await permissionService.deletePermission(req.params.id);
    if (ok) {
      logger.info('Deleted permission: %s', req.params.id);
      return res.status(204).end();
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('Permission deletion failed: %s', e?.message || e);
    res.status(400).json({ error: 'Permission deletion failed', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectUsers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const permissions = await permissionService.getPermissionsByResourceType(
      projectId,
      'user',
      pageIndex,
      pageSize,
      q,
    );
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch user permissions', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectLinkedItems = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const permissions = await permissionService.getPermissionsByResourceType(
      projectId,
      'linked-item',
      pageIndex,
      pageSize,
      q,
    );
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch linked-item permissions', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectFiles = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const permissions = await permissionService.getPermissionsByResourceType(
      projectId,
      'file',
      pageIndex,
      pageSize,
      q,
    );
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch file permissions', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectWebhooks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const permissions = await permissionService.getPermissionsByResourceType(
      projectId,
      'webhook',
      pageIndex,
      pageSize,
      q,
    );
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch webhook permissions', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectHistories = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const permissions = await permissionService.getPermissionsByResourceType(projectId, 'history');
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch history permissions', details: e?.message || String(e) });
  }
};

export const getPermissionsByProjectLocations = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const permissions = await permissionService.getPermissionsByResourceType(projectId, 'location');
    res.json(permissions);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch location permissions', details: e?.message || String(e) });
  }
};
