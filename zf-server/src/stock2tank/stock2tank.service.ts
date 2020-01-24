import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { Stock2tankRepository } from './stock2tank.repository';
import { TankLabelConfig } from '../tank/tank-label';
import { Stock2tank } from './stock-to-tank.entity';

@Injectable()
export class Stock2tankService {

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Stock2tankRepository)
    private readonly repo: Stock2tankRepository,
  ) {}

  async findSwimmersInTank(tankId): Promise<Stock2tank[]> {
    return this.repo.findSwimmersInTank(tankId);
  }
}
