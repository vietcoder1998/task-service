import express, { Router } from 'express';
import { parseQueryParams } from './middlewares/query.middleware';
import { boundaryResponse } from './middlewares/response.middleware';
import { attachAssetOnCreate, addHistoryOnUpdate } from './middlewares/asset.middleware';
import { createNotificationOnChange } from './middlewares/notification.middleware';
import assetRoutes from './routes/asset.routes';
import fileRouter from './routes/file.routes';
import ganttTaskRouter from './routes/ganttTask.routes';
import historyRouter from './routes/history.routes';
import linkedItemRouter from './routes/linkedItem.routes';
import locationRouter from './routes/location.routes';
import notificationRouter from './routes/notification.routes';
import permissionRouter from './routes/permission.routes';
import projectRouter from './routes/project.routes';
import todoRouter from './routes/todo.routes';
import userRouter from './routes/user.routes';
import webhookRouter from './routes/webhook.routes';
import jobRouter from './routes/job.routes';
import notificationTemplateRouter from './routes/notificationTemplate.routes';
import reportRouter from './routes/report.routes';
import labelRouter from './routes/label.routes';

class TaskServiceApp {
  public v1Router: Router;

  constructor() {
    this.v1Router = express.Router();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    // Request processing middlewares
    this.v1Router.use(parseQueryParams);
    this.v1Router.use(boundaryResponse);
    this.v1Router.use(attachAssetOnCreate);
    this.v1Router.use(addHistoryOnUpdate);
    this.v1Router.use(createNotificationOnChange);
  }

  private initializeRoutes(): void {
    // API routes
    this.v1Router.use('/projects', projectRouter);
    this.v1Router.use('/users', userRouter);
    this.v1Router.use('/todos', todoRouter);
    this.v1Router.use('/files', fileRouter);
    this.v1Router.use('/permissions', permissionRouter);
    this.v1Router.use('/linked-items', linkedItemRouter);
    this.v1Router.use('/gantt-tasks', ganttTaskRouter);
    this.v1Router.use('/webhooks', webhookRouter);
    this.v1Router.use('/histories', historyRouter);
    this.v1Router.use('/locations', locationRouter);
    this.v1Router.use('/assets', assetRoutes);
    this.v1Router.use('/notifications', notificationRouter);
    this.v1Router.use('/jobs', jobRouter);
    this.v1Router.use('/notification-templates', notificationTemplateRouter);
    this.v1Router.use('/reports', reportRouter);
    this.v1Router.use('/labels', labelRouter);
  }
}

export const taskServiceApp = new TaskServiceApp();
