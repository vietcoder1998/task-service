import { PrismaClient } from '@prisma/client';
import { Job } from '@/types';
import amqp from 'amqplib';
import { config } from '../../config/env.config';

const prisma = new PrismaClient();

// RabbitMQ connection and queue setup
const RABBITMQ_URL = config.messageQueue.rabbitmq.url;
const JOB_QUEUE = 'webhook-jobs';

let channel: amqp.Channel | null = null;

async function getChannel() {
  if (channel) return channel;
  const conn = await amqp.connect(RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue(JOB_QUEUE, { durable: true });
  return channel;
}

// Send a job to the queue (schedule)
async function scheduleJob(job: Job) {
  const ch = await getChannel();
  ch.sendToQueue(JOB_QUEUE, Buffer.from(JSON.stringify(job)), { persistent: true });
}

// Remove a job from the queue (unschedule) - not natively supported in RabbitMQ, so you need to implement logic to ignore/cancel jobs by id in your consumer
async function unscheduleJob(jobId: string) {
  // Mark job as cancelled in DB or use a separate queue for cancellations
  // For now, do nothing (RabbitMQ does not support removing specific messages from a queue)
}

// Consumer/worker for jobs
async function startJobConsumer() {
  const ch = await getChannel();
  ch.consume(JOB_QUEUE, async (msg: amqp.ConsumeMessage | null) => {
    if (msg) {
      const job: Job = JSON.parse(msg.content.toString());
      // Here you would call the webhook or perform the scheduled task
      // Example: await callWebhook(job.webhookId, job.schedule);
      console.log('Processing job:', job);
      ch.ack(msg);
    }
  });
}

startJobConsumer();

function fromPrismaJob(job: any): Job {
  return {
    ...job,
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
  };
}

export const getJobs = async (webhookId?: string): Promise<Job[]> => {
  const where = webhookId ? { webhookId } : {};
  const jobs = await prisma.job.findMany({ where });
  return jobs.map(fromPrismaJob);
};

export const getJobById = async (id: string): Promise<Job | null> => {
  const job = await prisma.job.findUnique({ where: { id } });
  return job ? fromPrismaJob(job) : null;
};

export const createJob = async (data: Partial<Job>): Promise<Job> => {
  const job = await prisma.job.create({ data: data as any });
  return fromPrismaJob(job);
};

export const updateJob = async (id: string, data: Partial<Job>): Promise<Job> => {
  const job = await prisma.job.update({ where: { id }, data: data as any });
  return fromPrismaJob(job);
};

export const deleteJob = async (id: string): Promise<void> => {
  await prisma.job.delete({ where: { id } });
};

export const startJob = async (id: string): Promise<Job> => {
  const job = await prisma.job.update({ where: { id }, data: { enabled: true } });
  const jobForQueue = fromPrismaJob(job);
  await scheduleJob(jobForQueue);
  return jobForQueue;
};

export const stopJob = async (id: string): Promise<Job> => {
  const job = await prisma.job.update({ where: { id }, data: { enabled: false } });
  await unscheduleJob(id);
  return fromPrismaJob(job);
};
