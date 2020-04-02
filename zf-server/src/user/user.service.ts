import {BadRequestException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { plainToClass } from 'class-transformer';
import {ResetPasswordDTO, UserDTO, UserPasswordChangeDTO} from "../common/user/UserDTO";
import {Logger} from "winston";
import {ADMIN_ROLE} from "../common/auth/zf-roles";
const crypto = require('crypto');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.makeSureAdminExists();
  }
  async makeSureAdminExists() {
    if (!await this.findByUserName('admin')) {
      const admin: User = await this.create({username: 'admin', role: ADMIN_ROLE, email: 'admin@admin.com'});
      admin.setPassword('admin');
      admin.passwordChangeRequired = true;
      await this.repo.save(admin);
    }
  }


  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findFiltered(filter: string): Promise<User[]> {
    if (!filter) { return await this.findAll(); }
    const f = "%" + filter + "%";
    return await this.repo.createQueryBuilder("u")
      .where("u.name LIKE :f", {f: f})
      .orWhere("u.email LIKE :f", {f: f})
      .orWhere("u.role LIKE :f", {f: f})
      .orWhere("u.email LIKE :f", {f: f})
      .orWhere("u.phone LIKE :f", {f: f})
      .orWhere("u.username LIKE :f", {f: f})
      .getMany();
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
    // TODO remember this is where you were thinking of using @hapi/joi
    delete dto.id; // a new user can not have an id.
    const u: User = plainToClass(User, dto);
    this.logger.debug('Setting random password for ' + u.username + ': ' + u.setRandomPassword());
    console.log('Setting random password for ' + u.username + ': ' + u.setRandomPassword());
    return this.repo.save(u);
  }

  // TODO convey the new password to the user.
  async resetPassword(dto: ResetPasswordDTO): Promise<User> {
    const u: User = await this.findByUsernameOrEmail(dto.usernameOrEmail);
    if (!u) {
      throw new UnauthorizedException('Can not reset password');
    }
    console.log('Setting random password for ' + u.username + ': ' + u.setRandomPassword());
    return this.repo.save(u);
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    return await this.repo.findOne({
      where: [
        {username: usernameOrEmail},
        {email: usernameOrEmail},
      ],
    });
  }

  async update(dto: UserDTO): Promise<User> {
    if (!dto.id) {
      const message = "Something is fishy, received a user update without a user id!";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    // we do not update passwords this way...
    Object.assign(u, dto);
    return this.repo.save(u);
  }

  async validateUserByPassword(username: string, pass: string): Promise<User> {
    const user = await this.findByUserName(username);
    if (user && user.isActive && user.validatePassword(pass)) {
      // Note we return the user with encrypted password and salt. We could remove those here.
      // However, the user is ultimately returned with ClassSerializerInterceptor which applies
      // the @Exclude annotation on these fields.  So bottom line, they do not get exported.
      return user;
    }
    return null;
  }

  async changePassword(u: User, dto: UserPasswordChangeDTO): Promise<User> {
    if (!u.validatePassword(dto.currentPassword)) {
      const message = 'password change for ' + u.username + ' with incorrect old password';
      this.logger.error(message);
      throw new BadRequestException("Incorrect old password");
    }
    u.setPassword(dto.newPassword);
    return this.repo.save(u);
  }

  async delete(dto: UserDTO): Promise<any> {
    const u: User = await this.repo.findOneOrFail(dto.id);
    return await this.repo.remove(u);
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return await this.repo.findOne({where: { username: username}});
  }

}
