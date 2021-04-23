import { Inject, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tank } from './tank.entity';
import {TankDto} from '../common/tank.dto';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {plainToClass} from 'class-transformer';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';
import {TankNeighborsDto} from '../common/tankNeighborsDto';

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
      if (tank.rack && tank.shelf && tank.slot) {
        tank.name = tank.rack + tank.shelf + tank.slot;
      } else {
        this.logAndThrowException(`Tank must have a name or rack/shelf/slot`);
      }
    }

    if (!tank.sortOrder) {
      this.logAndThrowException(`Tank must have a sortOrder`);
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

  // Find the tanks before and after a given place in the sort ordering
  // By default this ignores multi-tank tanks like the nursery.
  // Why?  a) Because they are not really tanks.
  // And b) the client is that Facility Audit and you don't
  // audit multi-tank tanks like the nursery on your phone.
  async getNeighbors(sortOrder: string = null): Promise<TankNeighborsDto> {
    const neighbors = new TankNeighborsDto();
    neighbors.previous = await this.findTankBefore(sortOrder);
    neighbors.next = await this.findTankAfter(sortOrder);
    return neighbors;
  }

  async findTankBefore(givenSortOrder: string): Promise<Tank> {
    return this.repo.createQueryBuilder('tank')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('max(sortOrder)')
          .from(Tank, 't')
          .where('t.sortOrder < :givenSortOrder')
          .andWhere('NOT t.isMultiTank')
          .getQuery();
        return 'sortOrder = ' + subQuery;
      })
      .setParameter('givenSortOrder', givenSortOrder)
      .getOne();
  }

  async findTankAfter(givenSortOrder: string): Promise<Tank> {
    return this.repo.createQueryBuilder('tank')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('min(sortOrder)')
          .from(Tank, 't')
          .where('t.sortOrder > :givenSortOrder')
          .andWhere('NOT t.isMultiTank')
          .getQuery();
        return 'sortOrder = ' + subQuery;
      })
      .setParameter('givenSortOrder', givenSortOrder)
      .getOne();
  }

  async validateAndRemove(id: any): Promise<any> {
    const candidate: Tank = await this.mustExist(id);
    // should check that there are no fish in the tank

    const deleted = await this.repo.remove(candidate);
    deleted.id = id;
    return deleted;
  }

  async mustExist(id: number): Promise<Tank> {
    const candidate: Tank = await this.repo.findOne(id);
    if (!candidate) {
      this.logAndThrowException(`98327751 Tank id: ${id} does not exist.`);
    }
    return candidate;
  }


}
