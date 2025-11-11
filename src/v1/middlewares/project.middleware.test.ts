import { describe, it, expect } from '@jest/globals';
import { validateProject } from './project.middleware';

describe('validateProject middleware', () => {
  it('should call next if name is valid', () => {
    const req = { body: { name: 'Project 1' } } as any;
    const res = {} as any;
    const next = jest.fn();
    validateProject(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(typeof req.body.id).toBe('string');
  });

  it('should return 400 if name is missing or not a string', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateProject({ body: {} } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Project name is required and must be a string.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
