import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';
import { UserRole } from '../../users/user.entity.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: any;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(reflector);
  });

  const context = (user: { roles: string[] } | undefined, roles: string[] | undefined) => {
    reflector.getAllAndOverride.mockReturnValue(roles);
    return ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;
  };

  it('should allow when the route has no roles metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(context(undefined, undefined))).toBe(true);
  });

  it('should allow when the user has one of the required roles', () => {
    expect(
      guard.canActivate(
        context({ roles: ['ADMIN', 'TECHNICIAN'] }, [UserRole.ADMIN]),
      ),
    ).toBe(true);
  });

  it('should reject when the user lacks the required role', () => {
    expect(() =>
      guard.canActivate(context({ roles: ['TECHNICIAN'] }, [UserRole.ADMIN])),
    ).toThrow('No tienes permisos');
  });

  it('should reject when there is no user on the request', () => {
    expect(() => guard.canActivate(context(undefined, [UserRole.ADMIN]))).toThrow(
      'No tienes permisos',
    );
  });
});
