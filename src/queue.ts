import amqp from 'amqplib';
import { config } from './config/env.config';
let channel: amqp.Channel | null = null;

export async function connectQueue() {
  const conn = await amqp.connect(config.messageQueue.rabbitmq.url);
  channel = await conn.createChannel();
  await channel.assertQueue(config.messageQueue.rabbitmq.queues.notification, { durable: false });
  await channel.assertQueue(config.messageQueue.rabbitmq.queues.todo, { durable: false });
}

export async function publishNotificationEvent(event: any) {
  if (!channel) await connectQueue();
  channel!.sendToQueue(
    config.messageQueue.rabbitmq.queues.notification,
    Buffer.from(JSON.stringify(event)),
  );
}

export async function publishTodoEvent(event: any) {
  if (!channel) await connectQueue();
  channel!.sendToQueue(
    config.messageQueue.rabbitmq.queues.todo,
    Buffer.from(JSON.stringify(event)),
  );
}
