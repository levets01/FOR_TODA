import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MecánicosService } from './mecánicos.service.js';
import { CreateMecánicoDto } from './dto/create-mecánico.dto.js';
import { UpdateMecánicoDto } from './dto/update-mecánico.dto.js';
import { Mecánico } from './entities/mecánico.entity.js';
import { Roles } from '../common/decorators/public.decorator.js';
import { UserRole } from '../users/user.entity.js';

@Controller('mecanicos')
@ApiTags('mecánicos')
@ApiResponse({ status: 401, description: 'No autenticado' })
@ApiResponse({ status: 403, description: 'Sin permisos' })
export class MecánicosController {
  constructor(private readonly mecánicosService: MecánicosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un mecánico (ADMIN)' })
  @ApiBody({
    type: CreateMecánicoDto,
    schema: {
      example: {
        nombre: 'Juan Pérez',
        email: 'juan.perez@fleet.local',
        especialidad: 'Frenos',
        estado: 'ACTIVE',
      },
    },
  })
  @ApiResponse({ status: 201, type: Mecánico, description: 'Mecánico creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  create(@Body() createMecánicoDto: CreateMecánicoDto) {
    return this.mecánicosService.create(createMecánicoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mecánicos' })
  @ApiResponse({ status: 200, type: [Mecánico], description: 'Lista de mecánicos' })
  findAll() {
    return this.mecánicosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un mecánico por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Mecánico, description: 'Mecánico encontrado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  findOne(@Param('id') id: string) {
    return this.mecánicosService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un mecánico (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateMecánicoDto })
  @ApiResponse({ status: 200, type: Mecánico, description: 'Mecánico actualizado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  update(@Param('id') id: string, @Body() updateMecánicoDto: UpdateMecánicoDto) {
    return this.mecánicosService.update(+id, updateMecánicoDto);
  }

  @Patch(':id/activar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar un mecánico (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Mecánico, description: 'Mecánico activado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  activar(@Param('id') id: string) {
    return this.mecánicosService.activar(+id);
  }

  @Patch(':id/inactivar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inactivar un mecánico (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Mecánico, description: 'Mecánico inactivado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  inactivar(@Param('id') id: string) {
    return this.mecánicosService.inactivar(+id);
  }
}
