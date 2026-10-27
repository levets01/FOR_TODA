import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMantenimientoDto } from './create-mantenimiento.dto.js';
import { MantenimientoTipo } from '../mantenimiento.entity.js';

describe('CreateMantenimientoDto validation', () => {
  it('should accept a valid maintenance creation', async () => {
    const dto = plainToInstance(CreateMantenimientoDto, {
      vehiculoId: 1,
      mecanicoId: 2,
      tipo: MantenimientoTipo.PREVENTIVE,
      descripcion: 'Cambio de aceite',
      kilometraje: 45000,
      scheduledStart: '2026-01-05T09:00:00Z',
      scheduledEnd: '2026-01-05T11:00:00Z',
      coste: 120,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject missing fields and invalid tipo', async () => {
    const dto = plainToInstance(CreateMantenimientoDto, {
      vehiculoId: 1,
      tipo: 'INEXISTENTE',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
