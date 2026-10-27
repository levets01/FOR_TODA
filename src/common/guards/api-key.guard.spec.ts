import { ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: any;

  beforeEach(() => {
    configService = {
      get: vi.fn().mockReturnValue(['clave-secreta-de-prueba']),
    };
    guard = new ApiKeyGuard(configService);
  });

  const context = (headers: Record<string, string | undefined>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow when the x-api-key header matches the env key', () => {
    expect(guard.canActivate(context({ 'x-api-key': 'clave-secreta-de-prueba' }))).toBe(true);
  });

  it('should reject when the header is missing', () => {
    expect(() => guard.canActivate(context({}))).toThrow(
      'Falta la cabecera x-api-key',
    );
  });

  it('should reject when the key is invalid', () => {
    expect(() => guard.canActivate(context({ 'x-api-key': 'clave-incorrecta' }))).toThrow(
      'API key inválida',
    );
  });

  it('should read the key from the environment variable', () => {
    guard.canActivate(context({ 'x-api-key': 'clave-secreta-de-prueba' }));
    expect(configService.get).toHaveBeenCalledWith('fleet.api.keys');
  });
});
