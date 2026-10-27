import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor.js';

describe('TransformInterceptor', () => {
  it('should wrap a successful response with timestamp and no message', async () => {
    const interceptor = new TransformInterceptor();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as unknown as any;
    const next = { handle: () => of({ id: 1, nombre: 'X' }) };

    const result = await interceptor.intercept(context, next).toPromise();

    expect(result).toEqual({
      success: true,
      statusCode: 201,
      data: { id: 1, nombre: 'X' },
      timestamp: expect.any(String),
    });
    expect(result.message).toBeUndefined();
  });
});
