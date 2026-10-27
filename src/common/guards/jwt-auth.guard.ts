import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context?: ExecutionContext,
    _status?: number,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Token de acceso inválido o expirado');
    }
    return user;
  }
}
