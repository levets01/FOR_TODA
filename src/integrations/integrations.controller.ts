import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VehículosService } from '../vehículos/vehículos.service.js';
import { MantenimientosService } from '../mantenimientos/mantenimientos.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

/**
 * Endpoint de integración para sistemas externos.
 * Ruta: GET /integrations/vehicles/:plate/maintenance-history
 * Protegido únicamente por la API key (cabecera x-api-key).
 * Salta el JWT global mediante @Public() y aplica ApiKeyGuard localmente.
 */
@Controller('integrations')
@ApiTags('integración')
export class IntegrationsController {
  constructor(
    private readonly vehículosService: VehículosService,
    private readonly mantenimientosService: MantenimientosService,
  ) {}

  @Get('vehicles/:plate/maintenance-history')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Historial de mantenimientos de un vehículo por placa (requiere x-api-key)',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key de integración (variable de entorno API_KEYS)',
    required: true,
  })
  @ApiParam({ name: 'plate', type: String, example: 'ABC-1234' })
  @ApiResponse({ status: 200, description: 'Historial de mantenimientos del vehículo' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async maintenanceHistory(@Param('plate') plate: string) {
    const vehiculo = await this.vehículosService.findByPlaca(plate);
    const historial = await this.mantenimientosService.findByVehiculo(vehiculo.id);
    return { placa: vehiculo.placa, mantenimientos: historial };
  }
}
