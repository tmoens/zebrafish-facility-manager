import {BadRequestException, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tank } from './tank.entity';
import {TankDto} from './tank.dto';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {plainToClass} from 'class-transformer';

@Injectable()
export class TankService {
  constructor(
    @InjectRepository(Tank)
    private readonly repo: Repository<Tank>,
  ) {}

  findAll(): Promise<Tank[]> {
    return this.repo.find();
  }

  async import(dto: TankDto): Promise<Tank> {
    convertEmptyStringToNull(dto);

    // ignore an id if given
    if (dto.id) delete dto.id;

    const candidate: Tank = plainToClass(Tank, dto);
    console.log (JSON.stringify(candidate));
    await this.validateForImport(candidate);
    return this.repo.save(candidate);
  }

  async validateForImport(tank: Tank): Promise<boolean> {
    const errors: string [] = [];
    // If there is no name, build it by concatenating rack/shelf/slot
    if (!tank.name) {
      const parts: string[] = [];
      if (tank.rack && tank.shelf && tank.slot) {
        tank.name = tank.rack + tank.shelf + tank.slot;
      } else {
        throw new BadRequestException(`Tank must have a name or rack/shelf/slot`);
      }
    }

    // tank name must be unique
    if (await this.repo.findOne({where: {name: tank.name}})) {
      throw new BadRequestException(`Tank ${tank.name} already exists`);
    }
    return true;
  }

}
