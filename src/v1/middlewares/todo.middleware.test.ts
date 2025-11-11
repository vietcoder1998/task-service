import { describe, it, expect } from '@jest/globals';
import { validateTodo } from './todo.middleware';

describe('validateTodo middleware', () => {
  it('should call next if valid POST', () => {
    const req = { method: 'POST', body: { title: 'Test', date: '2025-09-16' } } as any;
    const res = {} as any;
    const next = jest.fn();
    validateTodo(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(typeof req.body.id).toBe('string');
  });

  it('should call next if valid PATCH', () => {
    const req = { method: 'PATCH', body: { date: '2025-09-16' } } as any;
    const res = {} as any;
    const next = jest.fn();
    validateTodo(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if title is missing on POST', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateTodo({ method: 'POST', body: { date: '2025-09-16' } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Todo title is required and must be a non-empty string.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if date is missing or invalid', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateTodo({ method: 'POST', body: { title: 'Test' } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Todo date is required and must be in YYYY-MM-DD format.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
