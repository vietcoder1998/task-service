import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createReport = async (req: Request, res: Response) => {
  try {
    const { title, content, projectId } = req.body;
    const report = await prisma.report.create({
      data: { title, content, projectId },
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const reports = await prisma.report.findMany({
      where: projectId ? { projectId: String(projectId) } : {},
      include: { todos: true, tasks: true, files: true },
    });
    res.json(reports);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: { todos: true, tasks: true, files: true },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const report = await prisma.report.update({
      where: { id },
      data: { title, content },
    });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
