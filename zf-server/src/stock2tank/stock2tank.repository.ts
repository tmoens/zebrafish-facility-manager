import {EntityRepository, Repository} from 'typeorm';
import {classToPlain, plainToClassFromExist} from 'class-transformer';
import {Stock2tank} from './stock-to-tank.entity';
import {BadRequestException} from '@nestjs/common';

@EntityRepository(Stock2tank)
export class Stock2tankRepository extends Repository<Stock2tank> {

  constructor() {
    super();
  }

  async findAll(): Promise<any> {
    const items = await this.createQueryBuilder('m')
      .leftJoinAndSelect('m.stock', 's')
      .leftJoinAndSelect('m.tank', 't')
      .limit(10)
      .getMany();
    return classToPlain(items);
  }

  async findSwimmersInTank(tankId: number) {
    return await this.createQueryBuilder('i')
      .leftJoinAndSelect('i.stock', 's')
      .leftJoinAndSelect('i.tank', 't')
      .where('t.id = :tankId', {tankId})
      .getMany();
  }

  // For creation, create a fresh swimmer, merge in the DTO and save.
  // No validation performed.
  // TODO think about checking the dto for related objects - and delete them
  async createSwimmer(dto: any): Promise<any> {
    let candidate: Stock2tank = new Stock2tank();
    candidate = plainToClassFromExist(candidate, dto);
    return await this.saveOrFail(candidate);
  }

  // For update, lookup the swimmer, merge in the DTO and save.
  // No validation performed.
  // TODO think about checking the dto for related objects - and delete them
  async updateSwimmer(dto: any): Promise<any> {
    let candidate: Stock2tank = await this.findOrFail( dto.stockId, dto.tankId);
    candidate = plainToClassFromExist(candidate, dto);
    return await this.saveOrFail(candidate);
  }

  // There are no constraints on swimmer removal
  async removeSwimmer(stockId: number, tankId: number): Promise<any> {
    // When you use remove, it seems that TypeORM returns the object you deleted with the
    // id set to undefined.  Which makes some sense.
    // However the client wants to see the id of the deleted object, so we stuff
    // it back in.
    const deleted = await super.remove( await this.findOrFail(stockId, tankId));
    deleted.stockId = stockId;
    deleted.tankId = tankId;
    return deleted;
  }

  async findOrFail(stockId: number, tankId: number): Promise<Stock2tank> {
    const o: Stock2tank = await this.findOne( {stockId, tankId});
    if (o) {
      return o;
    } else {
      throw new BadRequestException(
        'Bad Request', 'Swimmer does not exist. stockId: ' + stockId + ' tankId: ' + tankId);
    }
  }

  async saveOrFail(o: Stock2tank): Promise<any> {
    return await this.save(o)
      .catch(error => {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException('Stock already in tank.');
        } else {
          throw new BadRequestException('error.message');
        }
      });
  }

  async getTankLabelInfo(tankIds: string[]) {
    return await this.createQueryBuilder('swimmer')
      .leftJoinAndSelect('swimmer.tank', 'tank')
      .leftJoinAndSelect('swimmer.stock', 'stock')
      .where('swimmer.tankId IN (' + tankIds.join(',') + ')')
      .getMany();
  }
}
