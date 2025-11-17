import { pingMySQL } from './prisma';
import { backupAllDatabase } from './v1/jobs/backup';

import logger from './logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { setupSocket } from './socket';
import { taskServiceApp } from './v1/index';
import { config } from './config/env.config';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MySQL ping endpoint
app.get('/api/ping-mysql', async (req: Request, res: Response) => {
  const ok = await pingMySQL();
  if (ok) {
    res.status(200).json({ status: 'ok', message: 'MySQL connection successful' });
  } else {
    res.status(500).json({ status: 'error', message: 'MySQL connection failed' });
  }
});

// Backup endpoint
app.post('/api/backup', async (req: Request, res: Response) => {
  try {
    const results = await backupAllDatabase();
    res.status(200).json({ status: 'ok', files: results });
  } catch (err) {
    logger.error('Backup failed', { err });
    res.status(500).json({ status: 'error', message: 'Backup failed', details: err });
  }
});

const httpServer = createServer(app);
setupSocket(httpServer);

// Mount v1 API routes
app.use('/api/v1', taskServiceApp.v1Router);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'server is running' });
});

const PORT = config.server.port;
httpServer.listen(PORT, () => {
  logger.info(`API server running on http://localhost:${PORT}`);
});
