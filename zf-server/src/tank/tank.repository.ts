import { EntityRepository, Repository } from 'typeorm';
import { Tank } from './tank.entity';

@EntityRepository(Tank)
export class TankRepository extends Repository<Tank> {

  constructor(
  ) {
    super();
  }

  async getAuditReport(): Promise<any[]> {
    // Sorry for the raw query here.  I did not add reverse many to one relationship from
    // tank to stocks in the entity definition for swimmers.
    // Had I don that I could have use the standard .leftJoin operation with QueryBuilder.
    const items: any[] = await this.query('SELECT t.name Tank, t.rack Rack, t.shelf Shelf, t.slot Spigot,' +
      's.name Stock, s2t.num FishCount, t.comment Comment ' +
      'FROM tank t ' +
      'LEFT JOIN stock2tank s2t on t.id = s2t.tankId ' +
      'LEFT JOIN stock s on s2t.stockId = s.id ' +
      'ORDER BY t.name');
    return items;
  }

  // For now, we just return them all - that is, we ignore ay filter.
  async findFiltered(params: any) {
    return this.createQueryBuilder('tanks')
      .getMany();
  }
}
