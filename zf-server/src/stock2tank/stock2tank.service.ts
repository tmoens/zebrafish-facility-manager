import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { Stock2tankRepository } from './stock2tank.repository';
import { TankLabelConfig } from '../tank/tank-label';
import { Stock2tank } from './stock-to-tank.entity';
import {plainToClassFromExist} from 'class-transformer';
import {TankService} from '../tank/tank.service';
import {SwimmerImportDto} from '../stock/stock-import-dto';

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

  // For creation, create a fresh swimmer, merge in the DTO and save.
  // No validation performed.
  // TODO think about checking the dto for related objects - and delete them
  async createSwimmer(dto: any): Promise<any> {
    let candidate: Stock2tank = new Stock2tank();
    candidate = plainToClassFromExist(candidate, dto);
    return await this.repo.saveOrFail(candidate);
  }

  // For import, create a fresh swimmer
  async importSwimmer(dto: SwimmerImportDto): Promise<Stock2tank> {
    let candidate: Stock2tank = new Stock2tank();
    candidate = plainToClassFromExist(candidate, dto);
    return await this.repo.saveOrFail(candidate);
  }

  // There are no constraints on swimmer removal
  async removeSwimmerByIds(stockId: number, tankId: number): Promise<any> {
    // When you use remove, it seems that TypeORM returns the object you deleted with the
    // id set to undefined.  Which makes some sense.
    // However the client wants to see the id of the deleted object, so we stuff
    // it back in.
    const deleted = await this.repo.remove( await this.repo.findOrFail(stockId, tankId));
    deleted.stockId = stockId;
    deleted.tankId = tankId;
    return deleted;
  }

  // There are no constraints on swimmer removal
  async removeSwimmer(swimmer: Stock2tank): Promise<any> {
    return await this.repo.remove(swimmer);
  }
}
