import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tank } from './tank.entity';

@Injectable()
export class TankService {
  constructor(
    @InjectRepository(Tank)
    private readonly photoRepository: Repository<Tank>,
  ) {}

  findAll(): Promise<Tank[]> {
    return this.photoRepository.find();
  }
}
