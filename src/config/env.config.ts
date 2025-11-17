import { EnvConfig } from '@shared/config/env.config';

/**
 * Task Service Environment Configuration
 * Uses shared EnvConfig and provides typed configuration for task-service
 */

// Create singleton instance of shared EnvConfig
const sharedEnvConfig = new EnvConfig();

// Construct RabbitMQ URL from shared config
const rabbitMQUrl =
  process.env.RABBITMQ_URL ||
  `amqp://${sharedEnvConfig.RABBITMQ_USER}:${sharedEnvConfig.RABBITMQ_PASS}@rabbitmq:${sharedEnvConfig.RABBITMQ_PORT}`;

// Export typed configurations for convenience
export const config = {
  serviceName: 'task-service',

  server: {
    port: parseInt(process.env.PORT || process.env.TASK_SERVICE_PORT || '4000', 10),
    baseUrl: process.env.TASK_SERVICE_BASE_URL || process.env.BASE_URL || `http://localhost:4000`,
  },

  database: {
    url: process.env.DATABASE_URL || '',
    mysql: {
      host: process.env.MYSQL_HOST || 'mysql',
      port: sharedEnvConfig.MYSQL_PORT,
      user: sharedEnvConfig.MYSQL_USER,
      password: sharedEnvConfig.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || sharedEnvConfig.MYSQL_DATABASE,
    },
    redis: {
      url: sharedEnvConfig.REDIS_URL,
      host: process.env.REDIS_HOST || 'redis',
      port: sharedEnvConfig.REDIS_PORT,
    },
  },

  messageQueue: {
    rabbitmq: {
      url: rabbitMQUrl,
      queues: {
        notification: process.env.RABBITMQ_QUEUE_NOTIFICATION || 'notification-events',
        todo: process.env.RABBITMQ_QUEUE_TODO || 'todo-events',
      },
    },
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || sharedEnvConfig.COMPANY_SITE_JWT_TOKEN,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  envConfig: sharedEnvConfig, // Export the full envConfig for advanced usage
};

// Export for backward compatibility and convenience
export const envConfig = sharedEnvConfig;

// Export constants for socket events (not environment-dependent)
export const SOCKET_EVENT = {
  ProjectSync: 'project:sync',
  TodoUpdated: 'todo:updated',
  NotificationNew: 'notification:new',
  ProjectJoinSuccess: 'project:join:success',
};
