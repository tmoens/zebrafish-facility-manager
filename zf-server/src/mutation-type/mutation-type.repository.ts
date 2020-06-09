import {EntityRepository, Repository} from 'typeorm';
import {MutationType} from "./mutation-type.entity";

@EntityRepository(MutationType)
export class MutationTypeRepository extends Repository<MutationType> {
  constructor() {
    super();
  }

  async findAll() {
    return await this.createQueryBuilder('m')
      .orderBy('m.name')
      .getMany();
  }
}
