require('dotenv').config();

export const PORT = process.env.PORT || 4000;
export const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test',
};

export const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const QUEUE_NAME = {
  Notification: process.env.RABBITMQ_QUEUE_NOTIFICATION || 'notification-events',
  Todo: process.env.RABBITMQ_QUEUE_TODO || 'todo-events',
};

export const SOCKET_EVENT = {
  ProjectSync: 'project:sync',
  TodoUpdated: 'todo:updated',
  NotificationNew: 'notification:new',
  ProjectJoinSuccess: 'project:join:success',
};
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
