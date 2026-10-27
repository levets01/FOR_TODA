import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mecánico, MecanicoEstado } from './entities/mecánico.entity.js';
import { CreateMecánicoDto } from './dto/create-mecánico.dto.js';
import { UpdateMecánicoDto } from './dto/update-mecánico.dto.js';

@Injectable()
export class MecánicosService {
  constructor(
    @InjectRepository(Mecánico)
    private readonly mecanicosRepository: Repository<Mecánico>,
  ) {}

  async create(createMecánicoDto: CreateMecánicoDto): Promise<Mecánico> {
    const existing = await this.mecanicosRepository.findOneBy({
      email: createMecánicoDto.email,
    });
    if (existing) {
      throw new ConflictException('Ya existe un mecánico con ese correo');
    }
    const mecanico = this.mecanicosRepository.create(createMecánicoDto);
    return this.mecanicosRepository.save(mecanico);
  }

  async findAll(): Promise<Mecánico[]> {
    return this.mecanicosRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Mecánico> {
    const mecanico = await this.mecanicosRepository.findOneBy({ id });
    if (!mecanico) {
      throw new NotFoundException(`Mecánico con id ${id} no encontrado`);
    }
    return mecanico;
  }

  async update(id: number, updateMecánicoDto: UpdateMecánicoDto): Promise<Mecánico> {
    const mecanico = await this.mecanicosRepository.findOneByOrFail({ id });
    Object.assign(mecanico, updateMecánicoDto);
    return this.mecanicosRepository.save(mecanico);
  }

  async activar(id: number): Promise<Mecánico> {
    const mecanico = await this.mecanicosRepository.findOneByOrFail({ id });
    mecanico.estado = MecanicoEstado.ACTIVE;
    return this.mecanicosRepository.save(mecanico);
  }

  async inactivar(id: number): Promise<Mecánico> {
    const mecanico = await this.mecanicosRepository.findOneByOrFail({ id });
    mecanico.estado = MecanicoEstado.INACTIVE;
    return this.mecanicosRepository.save(mecanico);
  }
}
