import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MantenimientosService } from './mantenimientos.service.js';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto.js';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto.js';
import { Mantenimiento } from './mantenimiento.entity.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/public.decorator.js';
import { UserRole } from '../users/user.entity.js';

@Controller('mantenimientos')
@ApiTags('mantenimientos')
@ApiBearerAuth('bearer')
@ApiResponse({ status: 401, description: 'No autenticado' })
@ApiResponse({ status: 403, description: 'Sin permisos' })
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un mantenimiento (ADMIN)' })
  @ApiBody({
    type: CreateMantenimientoDto,
    schema: {
      example: {
        vehiculoId: 10,
        mecanicoId: 20,
        tallerId: 30,
        tipo: 'PREVENTIVE',
        descripcion: 'Cambio de aceite y filtros',
        kilometraje: 45000,
        scheduledStart: '2026-01-05T09:00:00.000Z',
        scheduledEnd: '2026-01-05T11:00:00.000Z',
        estado: 'SCHEDULED',
      },
    },
  })
  @ApiResponse({ status: 201, type: Mantenimiento, description: 'Mantenimiento creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Vehículo, mecánico o taller no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto de disponibilidad o datos' })
  create(@Body() createMantenimientoDto: CreateMantenimientoDto) {
    return this.mantenimientosService.create(createMantenimientoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los mantenimientos' })
  @ApiResponse({ status: 200, type: [Mantenimiento], description: 'Lista de mantenimientos' })
  findAll(@CurrentUser() user: { userId: number; roles: string[] }) {
    return this.mantenimientosService.findAll(user);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar mantenimientos activos (SCHEDULED o IN_PROGRESS)' })
  @ApiResponse({ status: 200, type: [Mantenimiento], description: 'Mantenimientos activos' })
  findActivos(@CurrentUser() user: { userId: number; roles: string[] }) {
    return this.mantenimientosService.findActivos(user);
  }

  @Get('vehiculo/:vehiculoId')
  @ApiOperation({ summary: 'Mantenimientos por vehículo' })
  @ApiParam({ name: 'vehiculoId', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: [Mantenimiento], description: 'Mantenimientos del vehículo' })
  findByVehiculo(
    @Param('vehiculoId') vehiculoId: string,
    @CurrentUser() user: { userId: number; roles: string[] },
  ) {
    return this.mantenimientosService.findByVehiculo(+vehiculoId, user);
  }

  @Get('mecanico/:mecanicoId')
  @ApiOperation({ summary: 'Mantenimientos por mecánico' })
  @ApiParam({ name: 'mecanicoId', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: [Mantenimiento], description: 'Mantenimientos del mecánico' })
  findByMecanico(
    @Param('mecanicoId') mecanicoId: string,
    @CurrentUser() user: { userId: number; roles: string[] },
  ) {
    return this.mantenimientosService.findByMecanico(+mecanicoId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un mantenimiento por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Mantenimiento, description: 'Mantenimiento encontrado' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: number; roles: string[] }) {
    return this.mantenimientosService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Cambiar estado de un mantenimiento' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateMantenimientoDto })
  @ApiResponse({ status: 200, type: Mantenimiento, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  @ApiResponse({ status: 409, description: 'Transición no permitida o datos faltantes' })
  cambiarEstado(
    @Param('id') id: string,
    @Body() updateMantenimientoDto: UpdateMantenimientoDto,
    @CurrentUser() user: { userId: number; roles: string[] },
  ) {
    return this.mantenimientosService.cambiarEstado(+id, updateMantenimientoDto, user);
  }
}
