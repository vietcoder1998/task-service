import { describe, it, expect } from '@jest/globals';
import { validateUser } from './user.middleware';

describe('validateUser middleware', () => {
  it('should call next if name and email are valid', () => {
    const req = { body: { name: 'User', email: 'user@example.com' } } as any;
    const res = {} as any;
    const next = jest.fn();
    validateUser(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if name or email is missing or not a string', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    validateUser({ body: { name: 123, email: 'user@example.com' } } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Name and email are required and must be strings.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
