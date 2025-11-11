import { Request, Response } from 'express';
import logger from '../../logger';
import * as linkedItemService from '../services/linkedItem.service';

export const getLinkedItems = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const items = await linkedItemService.getLinkedItems(
      typeof projectId === 'string' ? projectId : undefined,
    );
    logger.info('Fetched linked items');
    res.json(items);
  } catch (e: any) {
    logger.error('Failed to fetch linked items: %s', e?.message || e);
    res
      .status(500)
      .json({ error: 'Failed to fetch linked items', details: e?.message || String(e) });
  }
};

export const createLinkedItem = async (req: Request, res: Response) => {
  try {
    const item = await linkedItemService.createLinkedItem({ ...req.body });
    logger.info('Created linked item: %o', item);
    res.status(201).json(item);
  } catch (e: any) {
    logger.error('LinkedItem creation failed: %s', e?.message || e);
    res.status(400).json({ error: 'LinkedItem creation failed', details: e?.message || String(e) });
  }
};

export const updateLinkedItem = async (req: Request, res: Response) => {
  try {
    const item = await linkedItemService.updateLinkedItem(req.params.id, req.body);
    if (item) {
      logger.info('Updated linked item: %o', item);
      return res.json(item);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('LinkedItem update failed: %s', e?.message || e);
    res.status(400).json({ error: 'LinkedItem update failed', details: e?.message || String(e) });
  }
};

export const deleteLinkedItem = async (req: Request, res: Response) => {
  try {
    const ok = await linkedItemService.deleteLinkedItem(req.params.id);
    if (ok) {
      logger.info('Deleted linked item: %s', req.params.id);
      return res.status(204).end();
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('LinkedItem deletion failed: %s', e?.message || e);
    res.status(400).json({ error: 'LinkedItem deletion failed', details: e?.message || String(e) });
  }
};
