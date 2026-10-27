import { Test, TestingModule } from '@nestjs/testing';
import { VehículosService } from './vehículos.service.js';
import { Vehículo } from './entities/vehículo.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('VehículosService', () => {
  let service: VehículosService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findOneByOrFail: vi.fn(),
      remove: vi.fn(),
      manager: { find: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehículosService,
        { provide: getRepositoryToken(Vehículo), useValue: repository },
      ],
    }).compile();

    service = module.get<VehículosService>(VehículosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
