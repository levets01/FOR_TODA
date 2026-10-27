import { Test, TestingModule } from '@nestjs/testing';
import { MecánicosController } from './mecánicos.controller.js';
import { MecánicosService } from './mecánicos.service.js';
import { Mecánico } from './entities/mecánico.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MecánicosController', () => {
  let controller: MecánicosController;

  beforeEach(async () => {
    const repository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      findOneByOrFail: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MecánicosController],
      providers: [
        MecánicosService,
        { provide: getRepositoryToken(Mecánico), useValue: repository },
      ],
    }).compile();

    controller = module.get<MecánicosController>(MecánicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
