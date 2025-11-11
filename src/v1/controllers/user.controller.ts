import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import logger from '../../logger';

export const getUsersByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId: string = req.params.id || req.params.projectId;
    const q = req.query.q as string | undefined;
    const pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
    logger.debug('Getting users for project: %s', projectId);
    const users = await userService.getUsersByProject(projectId, pageIndex, pageSize, q);
    logger.info('Fetched users for project: %s', projectId);
    res.json(users);
  } catch (e: any) {
    logger.error('Failed to fetch users for project: %s', e?.message || e);
    res
      .status(500)
      .json({ error: 'Failed to fetch users for project', details: e?.message || String(e) });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    logger.info('Fetched users');
    res.json(users);
  } catch (e: any) {
    logger.error('Failed to fetch users: %s', e?.message || e);
    res.status(500).json({ error: 'Failed to fetch users', details: e?.message || String(e) });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    logger.info('Created user: %o', user);
    res.status(201).json(user);
  } catch (e: any) {
    logger.error('User creation failed: %s', e?.message || e);
    res.status(400).json({ error: 'User creation failed', details: e?.message || String(e) });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await userService.updateUser(id, req.body);
    logger.info('Updated user: %o', user);
    res.json(user);
  } catch (e: any) {
    logger.error('User update failed: %s', e?.message || e);
    res.status(404).json({ error: 'User not found', details: e?.message || String(e) });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await userService.deleteUser(id);
    logger.info('Deleted user: %d', id);
    res.status(204).end();
  } catch (e: any) {
    logger.error('User deletion failed: %s', e?.message || e);
    res.status(404).json({ error: 'User not found', details: e?.message || String(e) });
  }
};
