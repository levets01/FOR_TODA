import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VehículosService } from './vehículos.service.js';
import { CreateVehículoDto } from './dto/create-vehículo.dto.js';
import { UpdateVehículoDto } from './dto/update-vehículo.dto.js';
import { Vehículo } from './entities/vehículo.entity.js';
import { Roles } from '../common/decorators/public.decorator.js';
import { UserRole } from '../users/user.entity.js';

@Controller('vehiculos')
@ApiTags('vehículos')
@ApiResponse({ status: 401, description: 'No autenticado' })
@ApiResponse({ status: 403, description: 'Sin permisos' })
export class VehículosController {
  constructor(private readonly vehículosService: VehículosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un vehículo (ADMIN)' })
  @ApiBody({
    type: CreateVehículoDto,
    schema: {
      example: {
        placa: 'ABC-1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
        kilometraje: 45000,
        estado: 'AVAILABLE',
      },
    },
  })
  @ApiResponse({ status: 201, type: Vehículo, description: 'Vehículo creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Placa duplicada' })
  create(@Body() createVehículoDto: CreateVehículoDto) {
    return this.vehículosService.create(createVehículoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vehículos' })
  @ApiResponse({ status: 200, type: [Vehículo], description: 'Lista de vehículos' })
  findAll() {
    return this.vehículosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Vehículo, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.vehículosService.findOne(+id);
  }

  @Get('placa/:placa')
  @ApiOperation({ summary: 'Obtener un vehículo por placa' })
  @ApiParam({ name: 'placa', type: String, example: 'ABC-1234' })
  @ApiResponse({ status: 200, type: Vehículo, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  findByPlaca(@Param('placa') placa: string) {
    return this.vehículosService.findByPlaca(placa);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un vehículo (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateVehículoDto })
  @ApiResponse({ status: 200, type: Vehículo, description: 'Vehículo actualizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  update(@Param('id') id: string, @Body() updateVehículoDto: UpdateVehículoDto) {
    return this.vehículosService.update(+id, updateVehículoDto);
  }

  @Patch(':id/inactivar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inactivar un vehículo (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: Vehículo, description: 'Vehículo inactivado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  inactivar(@Param('id') id: string) {
    return this.vehículosService.inactivar(+id);
  }
}
