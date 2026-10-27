import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateVehículoDto } from './create-vehículo.dto.js';
import { UpdateVehículoDto } from './update-vehículo.dto.js';

describe('CreateVehículoDto validation', () => {
  it('should accept a valid vehículo', async () => {
    const dto = plainToInstance(CreateVehículoDto, {
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      kilometraje: 1000,
      estado: 'AVAILABLE',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject missing required fields and invalid anio', async () => {
    const dto = plainToInstance(CreateVehículoDto, { anio: 1800 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should whitelist non-declared properties at validation level', async () => {
    const dto = plainToInstance(CreateVehículoDto, {
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      kilometraje: 1000,
      estado: 'AVAILABLE',
      campoInexistente: 'ignorado',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('UpdateVehículoDto validation', () => {
  it('should accept partial updates', async () => {
    const dto = plainToInstance(UpdateVehículoDto, { marca: 'Ford' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
