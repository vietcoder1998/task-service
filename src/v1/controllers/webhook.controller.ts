import { Request, Response } from 'express';
import * as webhookService from '../services/webhook.service';
import logger from '../../logger';

export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const webhooks = await webhookService.getWebhooks(
      typeof projectId === 'string' ? projectId : undefined,
    );
    logger.info('Fetched webhooks');
    res.json(webhooks);
  } catch (e: any) {
    logger.error('Failed to fetch webhooks: %s', e?.message || e);
    res.status(500).json({ error: 'Failed to fetch webhooks', details: e?.message || String(e) });
  }
};

export const createWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = await webhookService.createWebhook(req.body);
    logger.info('Created webhook: %o', webhook);
    res.status(201).json(webhook);
  } catch (e: any) {
    logger.error('Webhook creation failed: %s', e?.message || e);
    res.status(400).json({ error: 'Webhook creation failed', details: e?.message || String(e) });
  }
};

export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = await webhookService.updateWebhook(req.params.id, req.body);
    if (webhook) {
      logger.info('Updated webhook: %o', webhook);
      return res.json(webhook);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('Webhook update failed: %s', e?.message || e);
    res.status(400).json({ error: 'Webhook update failed', details: e?.message || String(e) });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const ok = await webhookService.deleteWebhook(req.params.id);
    if (ok) {
      logger.info('Deleted webhook: %s', req.params.id);
      return res.status(204).end();
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    logger.error('Webhook deletion failed: %s', e?.message || e);
    res.status(400).json({ error: 'Webhook deletion failed', details: e?.message || String(e) });
  }
};
