import { Test, TestingModule } from '@nestjs/testing';
import { VehículosController } from './vehículos.controller.js';
import { VehículosService } from './vehículos.service.js';
import { Vehículo } from './entities/vehículo.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('VehículosController', () => {
  let controller: VehículosController;

  beforeEach(async () => {
    const repository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findOneByOrFail: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehículosController],
      providers: [
        VehículosService,
        { provide: getRepositoryToken(Vehículo), useValue: repository },
      ],
    }).compile();

    controller = module.get<VehículosController>(VehículosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
