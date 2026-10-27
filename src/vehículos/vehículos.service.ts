import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehículo, VehiculoEstado } from './entities/vehículo.entity.js';
import { CreateVehículoDto } from './dto/create-vehículo.dto.js';
import { UpdateVehículoDto } from './dto/update-vehículo.dto.js';

@Injectable()
export class VehículosService {
  constructor(
    @InjectRepository(Vehículo)
    private readonly vehiculosRepository: Repository<Vehículo>,
  ) {}

  async create(createVehículoDto: CreateVehículoDto): Promise<Vehículo> {
    const existing = await this.vehiculosRepository.findOneBy({
      placa: createVehículoDto.placa,
    });
    if (existing) {
      throw new ConflictException('Ya existe un vehículo con esa placa');
    }
    const vehiculo = this.vehiculosRepository.create(createVehículoDto);
    return this.vehiculosRepository.save(vehiculo);
  }

  async findAll(): Promise<Vehículo[]> {
    return this.vehiculosRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Vehículo> {
    const vehiculo = await this.vehiculosRepository.findOneBy({ id });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehiculo;
  }

  async findByPlaca(placa: string): Promise<Vehículo> {
    const vehiculo = await this.vehiculosRepository.findOneBy({ placa });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con placa ${placa} no encontrado`);
    }
    return vehiculo;
  }

  async update(id: number, updateVehículoDto: UpdateVehículoDto): Promise<Vehículo> {
    const vehiculo = await this.vehiculosRepository.findOneByOrFail({ id });
    Object.assign(vehiculo, updateVehículoDto);
    return this.vehiculosRepository.save(vehiculo);
  }

  async inactivar(id: number): Promise<Vehículo> {
    const vehiculo = await this.vehiculosRepository.findOneByOrFail({ id });
    vehiculo.estado = VehiculoEstado.INACTIVE;
    return this.vehiculosRepository.save(vehiculo);
  }
}
