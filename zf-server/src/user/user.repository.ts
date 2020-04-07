import {EntityRepository, Repository} from 'typeorm';
import {User} from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  constructor() {
    super();
  }

  async findActive(id: string): Promise<User> {
    return this.findOne({where: {id: id, isActive: true}});
  }

}
