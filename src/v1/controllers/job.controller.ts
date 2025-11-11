import { Request, Response } from 'express';
import * as jobService from '../services/job.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const job = await jobService.createJob(req.body);
    res.status(201).json(job);
  } catch (e: any) {
    res.status(400).json({ error: 'Failed to create job', details: e?.message || String(e) });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getJobs(req.query.projectId as string);
    res.json(jobs);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: e?.message || String(e) });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.json(job);
  } catch (e: any) {
    res.status(400).json({ error: 'Failed to update job', details: e?.message || String(e) });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    await jobService.deleteJob(req.params.id);
    res.status(204).end();
  } catch (e: any) {
    res.status(400).json({ error: 'Failed to delete job', details: e?.message || String(e) });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch job', details: e?.message || String(e) });
  }
};
