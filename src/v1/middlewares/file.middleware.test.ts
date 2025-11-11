import { describe, it, expect } from '@jest/globals';
import { validateFile } from './file.middleware';

describe('validateFile middleware', () => {
  it('should call next if id is valid', () => {
    const req = { body: { id: 'abc' } } as any;
    const res = {} as any;
    const next = jest.fn();
    validateFile(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if id is missing or not a string', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateFile({ body: {} } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'File id is required and must be a string.' });
    expect(next).not.toHaveBeenCalled();
  });
});
