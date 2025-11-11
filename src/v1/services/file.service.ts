import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { FileItem as FileItemType } from '../../types';
const prisma = new PrismaClient();

const fromPrismaFile = (prismaFile: any): FileItemType => ({
  id: prismaFile.id,
  name: prismaFile.name ?? null,
  url: prismaFile.url ?? null,
  createdAt: prismaFile.createdAt
    ? (prismaFile.createdAt.toISOString?.() ?? prismaFile.createdAt)
    : null,
  updatedAt: prismaFile.updatedAt
    ? (prismaFile.updatedAt.toISOString?.() ?? prismaFile.updatedAt)
    : null,
  projectId: prismaFile.projectId,
  assetId: prismaFile.assetId ?? null,
  status: prismaFile.status ?? null,
  position: prismaFile.position ?? null,
});

export const getFiles = async (projectId?: string) => {
  if (projectId) {
    const files = await prisma.fileItem.findMany({ where: { projectId: { equals: projectId } } });
    return files.map(fromPrismaFile);
  }
  const files = await prisma.fileItem.findMany();
  return files.map(fromPrismaFile);
};

export const createFile = async (fileData: FileItemType) => {
  try {
    let assetId: string | null = null;
    let position = fileData.position ?? 0;
    if (position == null && fileData.projectId) {
      const max = await prisma.fileItem.aggregate({
        where: { projectId: fileData.projectId },
        _max: { position: true },
      });
      position = (max._max?.position ?? 0) + 1;
    }

    // If fileData._upload is present, handle local upload
    if ((fileData as any)._upload) {
      const upload = (fileData as any)._upload as { buffer: Buffer; originalname: string };
      const uploadDir = path.resolve(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}_${upload.originalname}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, upload.buffer);
      fileData.url = `/uploads/${filename}`;
    }

    // Only pass allowed fields to Prisma
    const created = await prisma.fileItem.create({
      data: {
        id: fileData.id ?? '',
        name: fileData.name ?? null,
        url: fileData.url ?? null,
        createdAt: fileData.createdAt ?? null,
        updatedAt: fileData.updatedAt ?? null,
        projectId: fileData.projectId ?? '',
        assetId: fileData.assetId ?? null,
        label: fileData.label ?? null,
        status: fileData.status ?? 1,
        position: position,
      },
    });

    // If type is document, add a record to documents table
    // if ((fileData as any).type === 'document' && prisma.document) {
    //   await prisma.document.create({
    //     data: {
    //       fileId: created.id,
    //       name: created.name,
    //       url: created.url,
    //       createdAt: created.createdAt,
    //       updatedAt: created.updatedAt,
    //     },
    //   });
    // }

    return fromPrismaFile(created);
  } catch (err) {
    throw err;
  }
};

export const deleteFile = async (id: string) => {
  try {
    await prisma.fileItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
export function updateFile(id: string, body: any) {
  return prisma.fileItem
    .update({
      where: { id },
      data: body,
    })
    .then((file) => (file ? fromPrismaFile(file) : null));
}

export function getFile(id: string) {
  return prisma.fileItem
    .findUnique({ where: { id } })
    .then((file) => (file ? fromPrismaFile(file) : null));
}
