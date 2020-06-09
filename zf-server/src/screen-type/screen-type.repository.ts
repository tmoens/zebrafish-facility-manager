import {EntityRepository, Repository} from 'typeorm';
import {ScreenType} from "./screen-type.entity";

@EntityRepository(ScreenType)
export class ScreenTypeRepository extends Repository<ScreenType> {
  constructor() {
    super();
  }

  async findAll() {
    return await this.createQueryBuilder('s')
      .orderBy('s.name')
      .getMany();
  }
}
