import * as notificationTemplateService from '../services/notificationTemplate.service';
import { Request, Response } from 'express';

export async function getTemplatesByProjectId(req: Request, res: Response) {
  const { projectId } = req.params;
  if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
  try {
    const templates = await notificationTemplateService.getTemplatesByProjectId(projectId);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification templates' });
  }
}

export const getNotificationTemplates = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const templates = await notificationTemplateService.getNotificationTemplates(
      projectId as string,
    );
    res.json(templates);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch notification templates', details: e?.message || String(e) });
  }
};

export const getNotificationTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await notificationTemplateService.getNotificationTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'Failed to fetch notification template', details: e?.message || String(e) });
  }
};

export const createNotificationTemplate = async (req: Request, res: Response) => {
  try {
    const template = await notificationTemplateService.createNotificationTemplate(req.body);
    res.status(201).json(template);
  } catch (e: any) {
    res
      .status(400)
      .json({ error: 'Failed to create notification template', details: e?.message || String(e) });
  }
};

export const updateNotificationTemplate = async (req: Request, res: Response) => {
  try {
    const template = await notificationTemplateService.updateNotificationTemplate(
      req.params.id,
      req.body,
    );
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (e: any) {
    res
      .status(400)
      .json({ error: 'Failed to update notification template', details: e?.message || String(e) });
  }
};

export const deleteNotificationTemplate = async (req: Request, res: Response) => {
  try {
    const ok = await notificationTemplateService.deleteNotificationTemplate(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e: any) {
    res
      .status(400)
      .json({ error: 'Failed to delete notification template', details: e?.message || String(e) });
  }
};
