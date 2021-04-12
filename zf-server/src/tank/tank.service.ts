import {BadRequestException, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tank } from './tank.entity';
import {TankDto} from './tank.dto';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {plainToClass} from 'class-transformer';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';

@Injectable()
export class TankService extends GenericService{
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectRepository(Tank)
    private readonly repo: Repository<Tank>,
  ) {
    super(logger);
  }

  findAll(): Promise<Tank[]> {
    return this.repo.find();
  }

  async import(dto: TankDto): Promise<Tank> {
    convertEmptyStringToNull(dto);
    // ignore an id if given
    this.ignoreAttribute(dto, 'id');
    const candidate: Tank = plainToClass(Tank, dto);
    await this.validateForImport(candidate);
    return this.repo.save(candidate);
  }

  async validateForImport(tank: Tank): Promise<boolean> {
    // If there is no name, build it by concatenating rack/shelf/slot
    if (!tank.name) {
      const parts: string[] = [];
      if (tank.rack && tank.shelf && tank.slot) {
        tank.name = tank.rack + tank.shelf + tank.slot;
      } else {
        this.logAndThrowException(`Tank must have a name or rack/shelf/slot`);
      }
    }

    // tank name must be unique
    if (await this.repo.findOne({where: {name: tank.name}})) {
      this.logAndThrowException(`Tank ${tank.name} already exists`);
    }
    return true;
  }

  async findTankByName(tankName: string): Promise<Tank> {
    // tank name must be unique
    return this.repo.findOne({where: {name: tankName}});
  }
}
