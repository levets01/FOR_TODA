import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SkipTransform } from '../common/decorators/skip-transform.decorator.js';

@Controller('auth')
@ApiTags('autenticación')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @SkipTransform()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    type: RegisterDto,
    schema: {
      example: { email: 'tecnico@fleet.local', password: 'Tecnico123!' },
    },
  })
  @ApiOkResponse({
    description: 'Usuario registrado y token JWT emitido',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Operación realizada correctamente',
        data: { accessToken: 'jwt-token', user: { id: 1, email: 'admin@fleet.local', role: 'ADMIN' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @SkipTransform()
  @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
  @ApiBody({
    type: LoginDto,
    schema: {
      example: { email: 'tecnico@fleet.local', password: 'Tecnico123!' },
    },
  })
  @ApiOkResponse({
    description: 'Login exitoso',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Operación realizada correctamente',
        data: { accessToken: 'jwt-token', user: { id: 1, email: 'tecnico@fleet.local', role: 'TECHNICIAN' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Datos del usuario autenticado' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({ description: 'Usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  me(@CurrentUser() user: { userId: number; email: string; roles: string[] }) {
    return user;
  }
}
