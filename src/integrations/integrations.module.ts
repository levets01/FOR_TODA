import { Module } from '@nestjs/common';
import { VehículosModule } from '../vehículos/vehículos.module.js';
import { MantenimientosModule } from '../mantenimientos/mantenimientos.module.js';
import { IntegrationsController } from './integrations.controller.js';

@Module({
  imports: [VehículosModule, MantenimientosModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
