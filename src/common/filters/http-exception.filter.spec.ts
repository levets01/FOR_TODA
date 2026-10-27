import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logErrorSpy: ReturnType<typeof vi.spyOn>;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const mockRequest = { url: '/api/vehiculos/123' };
  const host = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as unknown as any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    logErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    mockResponse.status.mockClear();
    mockResponse.json.mockClear();
  });

  afterEach(() => {
    logErrorSpy.mockRestore();
  });

  it('should handle HttpException with a consistent format', () => {
    filter.catch(new NotFoundException('Recurso no encontrado'), host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      message: 'Recurso no encontrado',
      path: '/api/vehiculos/123',
      timestamp: expect.any(String),
    });
  });

  it('should handle validation errors (message array)', () => {
    filter.catch(
      new BadRequestException({
        message: ['email must be an email', 'password too short'],
      }),
      host,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'email must be an email, password too short',
      }),
    );
  });

  it('should not expose stack traces for unexpected errors', () => {
    filter.catch(new Error('algo inesperado'), host);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      message: 'Error interno del servidor',
      path: '/api/vehiculos/123',
      timestamp: expect.any(String),
    });
    expect(logErrorSpy).toHaveBeenCalled();
  });
});
