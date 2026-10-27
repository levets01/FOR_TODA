import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

class TestController {
  @Public()
  publicRoute() {}

  privateRoute() {}
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow public routes without a token', async () => {
    const context = {
      getHandler: () => TestController.prototype.publicRoute,
      getClass: () => TestController,
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;
    expect(await guard.canActivate(context)).toBe(true);
  });

  describe('handleRequest', () => {
    it('should return the user when authentication succeeded', async () => {
      const user = { userId: 1, email: 'a@b.com', roles: ['ADMIN'] };
      expect(await guard.handleRequest(null, user, null)).toEqual(user);
    });

    it('should throw when there is an error', () => {
      expect(() =>
        guard.handleRequest(new Error('token expired'), null, null),
      ).toThrow(/token expired/);
    });

    it('should throw when there is no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Token de acceso inválido o expirado',
      );
    });
  });
});
