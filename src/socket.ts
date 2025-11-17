import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import amqp from 'amqplib';
import { config, SOCKET_EVENT } from './config/env.config';
import logger from './logger';
let io: SocketIOServer | null = null;

export function broadcastProjectSync(projectId: string, payload: any = {}) {
  if (!io) return;
  io.to(`project:${projectId}`).emit(SOCKET_EVENT.ProjectSync, { projectId, ...payload });
}

export function emitTodoUpdate(projectId: string, todo: any) {
  if (!io) return;
  io.to(`project:${projectId}`).emit(SOCKET_EVENT.TodoUpdated, { projectId, todo });
}

export function joinProjectRoom(socket: Socket, projectId: string) {
  socket.join(`project:${projectId}`);
}

export function setupSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info('A user connected:', socket.id);

    socket.on('joinProject', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`Socket ${socket.id} joined project:${projectId}`);
      // Emit success event to the joining socket
      socket.emit(SOCKET_EVENT.ProjectJoinSuccess, { projectId });
    });

    socket.on('todo:update', ({ projectId, todo }: { projectId: string; todo: any }) => {
      emitTodoUpdate(projectId, todo);
    });

    socket.on('disconnect', () => {
      logger.info('User disconnected:', socket.id);
    });
  });

  // Start RabbitMQ consumers for notification and todo events
  (async () => {
    try {
      const conn = await amqp.connect(config.messageQueue.rabbitmq.url);
      const channel = await conn.createChannel();
      await channel.assertQueue(config.messageQueue.rabbitmq.queues.notification, {
        durable: false,
      });
      await channel.assertQueue(config.messageQueue.rabbitmq.queues.todo, { durable: false });

      // Notification events
      channel.consume(config.messageQueue.rabbitmq.queues.notification, (msg) => {
        if (msg !== null) {
          try {
            const event: any = JSON.parse(msg.content.toString());
            if (event.type === 'notification' && event.projectId && event.notification) {
              io!
                .to(`project:${event.projectId}`)
                .emit(SOCKET_EVENT.NotificationNew, event.notification);
            }
          } catch (err) {
            // Optionally log error
          }
          channel.ack(msg);
        }
      });

      // Todo events
      channel.consume(config.messageQueue.rabbitmq.queues.todo, (msg) => {
        if (msg !== null) {
          try {
            const event: any = JSON.parse(msg.content.toString());
            if (event.type === 'todo' && event.projectId && event.todo) {
              io!
                .to(`project:${event.projectId}`)
                .emit(SOCKET_EVENT.TodoUpdated, { projectId: event.projectId, todo: event.todo });
            }
          } catch (err) {
            // Optionally log error
          }
          channel.ack(msg);
        }
      });
    } catch (err) {
      // Optionally log error
    }
  })();

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}
