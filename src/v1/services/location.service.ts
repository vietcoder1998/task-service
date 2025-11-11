import { Location } from '../../types';
import { PrismaClient } from '@prisma/client';
import { createAsset } from './asset.util';

const prisma = new PrismaClient();
function fromPrismaLocation(loc: any): Location {
  return {
    ...loc,
    googleMapsLink: loc.googleMapsLink ?? null,
    createdAt: loc.createdAt instanceof Date ? loc.createdAt.toISOString() : loc.createdAt,
    updatedAt: loc.updatedAt instanceof Date ? loc.updatedAt.toISOString() : loc.updatedAt,
  };
}

export async function getLocationsByProjectId(projectId: string): Promise<Location[]> {
  const results = await prisma.location.findMany({ where: { projectId } });
  return results.map(fromPrismaLocation);
}

export async function createLocation(
  projectId: string,
  data: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>,
): Promise<Location> {
  // Create asset and link
  let assetId: string | null = null;
  if (data.name) {
    assetId = await createAsset(data.name, 'location');
  }
  let position = (data as any).position;
  if (position == null) {
    const max = await prisma.location.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    position = (max._max?.position ?? 0) + 1;
  }
  const loc = await prisma.location.create({
    data: {
      ...data,
      projectId,
      assetId,
      position,
      status: data.status === null ? undefined : data.status,
      // Fix config typing for Prisma
    },
  });
  return fromPrismaLocation(loc);
}

export async function getLocationById(
  projectId: string,
  locationId: string,
): Promise<Location | null> {
  const loc = await prisma.location.findFirst({ where: { id: locationId, projectId } });
  return loc ? fromPrismaLocation(loc) : null;
}

export async function updateLocation(
  projectId: string,
  locationId: string,
  data: Partial<Location>,
): Promise<Location | null> {
  // Remove projectId from data if present
  const { projectId: _ignore, ...updateData } = data;
  const loc = await prisma.location.update({
    where: { id: locationId },
    data: {
      ...updateData,
      status: updateData.status === null ? undefined : updateData.status,
      // Fix config typing for Prisma
    },
  });
  return loc ? fromPrismaLocation(loc) : null;
}

export async function deleteLocation(projectId: string, locationId: string): Promise<void> {
  await prisma.location.delete({ where: { id: locationId } });
}
