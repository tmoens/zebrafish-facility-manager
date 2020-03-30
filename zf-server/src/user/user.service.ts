import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { plainToClass } from 'class-transformer';
import {UserDTO} from "../common/user/UserDTO";
const crypto = require('crypto');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User> {
    return this.repo.findOne(id);
  }

  // TODO add "active" or "state" to the user entity and then filter on that state here.
  findActiveUser(id: string): Promise<User> {
    return this.repo.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async create(dto: UserDTO): Promise<User> {
    const u: User = plainToClass(User, dto);
    u.salt = crypto.randomBytes(16).toString('hex');
    u.password = crypto.scryptSync(u.password, u.salt, 64, {N: 1024}).toString('hex');
    return this.repo.save(u);
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return await this.repo.findOne({where: { userChosenId: username}});
  }
}
