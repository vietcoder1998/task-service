import { Request, Response, NextFunction } from 'express';
import * as locationService from '../services/location.service';
import logger from '../../logger';

// GET /projects/:id/locations
export async function getLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id;
    logger.info('Fetching locations for projectId: %s', projectId);
    const locations = await locationService.getLocationsByProjectId(projectId);
    res.json(locations);
  } catch (err) {
    next(err);
  }
}

// POST /projects/:id/locations
export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.body.projectId;
    const location = await locationService.createLocation(projectId, req.body);
    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
}

// GET /projects/:id/locations/:locationId
export async function getLocationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: projectId, locationId } = req.params;
    const location = await locationService.getLocationById(projectId, locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    next(err);
  }
}

// PUT /projects/:id/locations/:locationId
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: projectId, locationId } = req.params;
    const updated = await locationService.updateLocation(projectId, locationId, req.body);
    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /projects/:id/locations/:locationId
export async function deleteLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: projectId, locationId } = req.params;
    await locationService.deleteLocation(projectId, locationId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
