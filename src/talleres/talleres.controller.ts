import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TalleresService } from './talleres.service.js';
import { CreateTallerDto } from './dto/create-taller.dto.js';
import { UpdateTallerDto } from './dto/update-taller.dto.js';
import { Taller } from './taller.entity.js';
import { Roles } from '../common/decorators/public.decorator.js';
import { UserRole } from '../users/user.entity.js';

@Controller('talleres')
@ApiTags('talleres')
@ApiResponse({ status: 401, description: 'No autenticado' })
@ApiResponse({ status: 403, description: 'Sin permisos' })
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un taller (ADMIN)' })
  @ApiBody({
    type: CreateTallerDto,
    schema: {
      example: {
        nombre: 'Taller Central',
        direccion: 'Av. Principal 100',
        telefono: '555-0200',
        estado: 'ACTIVE',
      },
    },
  })
  @ApiResponse({ status: 201, type: Taller, description: 'Taller creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.talleresService.create(createTallerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar talleres activos' })
  @ApiResponse({ status: 200, type: [Taller], description: 'Lista de talleres activos' })
  findAll() {
    return this.talleresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un taller por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Taller, description: 'Taller encontrado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  findOne(@Param('id') id: string) {
    return this.talleresService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un taller (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateTallerDto })
  @ApiResponse({ status: 200, type: Taller, description: 'Taller actualizado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  update(@Param('id') id: string, @Body() updateTallerDto: UpdateTallerDto) {
    return this.talleresService.update(+id, updateTallerDto);
  }

  @Patch(':id/activar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar un taller (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Taller, description: 'Taller activado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  activar(@Param('id') id: string) {
    return this.talleresService.activar(+id);
  }

  @Patch(':id/inactivar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inactivar un taller (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Taller, description: 'Taller inactivado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  inactivar(@Param('id') id: string) {
    return this.talleresService.inactivar(+id);
  }
}
