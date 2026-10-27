import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string | undefined;
    const expected: string[] = this.configService.get<string[]>('fleet.api.keys') ?? [];

    if (!apiKey || expected.length === 0) {
      throw new UnauthorizedException('Falta la cabecera x-api-key');
    }

    if (!expected.includes(apiKey)) {
      throw new UnauthorizedException('API key inválida');
    }

    return true;
  }
}
