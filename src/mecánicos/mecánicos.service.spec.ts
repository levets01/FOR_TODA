import { Test, TestingModule } from '@nestjs/testing';
import { MecánicosService } from './mecánicos.service.js';
import { Mecánico } from './entities/mecánico.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MecánicosService', () => {
  let service: MecánicosService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findOneByOrFail: vi.fn(),
      manager: { find: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MecánicosService,
        { provide: getRepositoryToken(Mecánico), useValue: repository },
      ],
    }).compile();

    service = module.get<MecánicosService>(MecánicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
