import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

/**
 * Filtro global de excepciones.
 * Toda respuesta de error usa el formato:
 * { success: false, statusCode, message, path, timestamp }
 * Traduce la violación de unicidad de Postgres (codigo 23505) a 409 Conflict.
 * Ninguna excepción esperada devuelve 500.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = 500;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const respuesta = exception.getResponse() as any;
      message =
        typeof respuesta === 'string'
          ? respuesta
          : respuesta?.message ?? 'Error en la solicitud';
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception && typeof exception === 'object' && 'code' in exception) {
      // Violación de unicidad de PostgreSQL -> 409 Conflict
      if ((exception as any).code === '23505') {
        statusCode = 409;
        message = 'Ya existe un registro con esos datos únicos';
      } else {
        this.logger.error(
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
    } else {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
