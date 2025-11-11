import { describe, it, expect } from '@jest/globals';
import { validateGanttTask } from './ganttTask.middleware';

describe('validateGanttTask middleware', () => {
  it('should call next if id is valid', () => {
    const req = {
      body: {
        id: 'abc',
        color: 'blue',
        startDate: '2025-09-16',
        endDate: '2025-09-17',
        name: 'Task',
      },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateGanttTask(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if id is missing or not a string', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateGanttTask({ body: {} } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'GanttTask id is required and must be a string.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
