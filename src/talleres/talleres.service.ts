import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taller, TallerEstado } from './taller.entity.js';
import { CreateTallerDto } from './dto/create-taller.dto.js';
import { UpdateTallerDto } from './dto/update-taller.dto.js';

@Injectable()
export class TalleresService {
  constructor(
    @InjectRepository(Taller)
    private readonly talleresRepository: Repository<Taller>,
  ) {}

  async create(createTallerDto: CreateTallerDto): Promise<Taller> {
    const taller = this.talleresRepository.create(createTallerDto);
    return this.talleresRepository.save(taller);
  }

  async findAll(): Promise<Taller[]> {
    return this.talleresRepository.find({
      where: { estado: TallerEstado.ACTIVE },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Taller> {
    const taller = await this.talleresRepository.findOneBy({ id });
    if (!taller) {
      throw new NotFoundException(`Taller con id ${id} no encontrado`);
    }
    return taller;
  }

  async update(id: number, updateTallerDto: UpdateTallerDto): Promise<Taller> {
    const taller = await this.talleresRepository.findOneByOrFail({ id });
    Object.assign(taller, updateTallerDto);
    return this.talleresRepository.save(taller);
  }

  async activar(id: number): Promise<Taller> {
    const taller = await this.talleresRepository.findOneByOrFail({ id });
    taller.estado = TallerEstado.ACTIVE;
    return this.talleresRepository.save(taller);
  }

  async inactivar(id: number): Promise<Taller> {
    const taller = await this.talleresRepository.findOneByOrFail({ id });
    taller.estado = TallerEstado.INACTIVE;
    return this.talleresRepository.save(taller);
  }
}
