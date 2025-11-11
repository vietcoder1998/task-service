import fs from 'fs';
import path from 'path';
import { prisma } from '../../prisma';

export async function backupData(name: string, data: any, timeoutMs = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const backupDir = path.resolve(__dirname, '../../backup');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(backupDir, `time_${timestamp}_${name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        resolve(filePath);
      } catch (err) {
        reject(err);
      }
    }, timeoutMs);
  });
}

// Backup all tables in the database that Prisma can load
export async function backupAllDatabase(timeoutMs = 1000): Promise<string[]> {
  const entities = [
    'todo',
    'project',
    'user',
    'fileItem',
    'webhook',
    'linkedItem',
    'location',
    'history',
    'ganttTask',
    // Add more model names as needed from your Prisma schema
  ];

  const results: string[] = [];
  for (const entity of entities) {
    // @ts-ignore
    const rows = await prisma[entity].findMany();
    const filePath = await backupData(entity, rows, timeoutMs);
    results.push(filePath);
  }
  return results;
}

// Example usage:
// await backupAllDatabase();
