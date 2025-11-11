import { Request, Response } from 'express';
import * as assetService from '../services/asset.service';

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const assets = await assetService.getAssets(id as string | undefined);
    res.json(assets);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch assets', details: e?.message || String(e) });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await assetService.getAssetById(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch asset', details: e?.message || String(e) });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    // Asset is created in middleware, just return assetId
    res.status(201).json({ assetId: req.body.assetId });
  } catch (e: any) {
    res.status(400).json({ error: 'Asset creation failed', details: e?.message || String(e) });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await assetService.updateAsset(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Asset not found' });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: 'Asset update failed', details: e?.message || String(e) });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await assetService.deleteAsset(id);
    if (!deleted) return res.status(404).json({ message: 'Asset not found' });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: 'Asset deletion failed', details: e?.message || String(e) });
  }
};
