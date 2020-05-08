import {BadRequestException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './user.entity';
import {plainToClass} from 'class-transformer';
import {ResetPasswordDTO, UserDTO, UserPasswordChangeDTO} from "../common/user/UserDTO";
import {Logger} from "winston";
import {ADMIN_ROLE} from "../common/auth/zf-roles";
import {JwtService} from "@nestjs/jwt";
import {UserRepository} from "./user.repository";
import {ZFMailerService} from "../mailer/mailer-service";
import {ConfigService} from "../config/config.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private readonly repo: UserRepository,
    @Inject('winston') private readonly logger: Logger,
    private jwtService: JwtService,
    private mailerService: ZFMailerService,
    private configService: ConfigService,
  ) {
    this.makeSureAdminExists();
  }

  // when a system starts up, it needs at least one user, in this case the admin user
  // with the password "admin" set up so that the user must change her password when
  // she first logs in.
  // FWIW, the config file checker ensures that the configuration fields are present.
  async makeSureAdminExists() {
    if (!await this.findByUserName(this.configService.defaultAdminUserName)) {
      const admin: User = await this.create({
        username: this.configService.defaultAdminUserName,
        role: ADMIN_ROLE,
        email: this.configService.defaultAdminUserEmail});
      admin.setPassword(this.configService.defaultAdminUserPassword);
      admin.passwordChangeRequired = true;
      await this.repo.save(admin);
    }
  }

  async login(user: User): Promise<string> {
    const token = this.buildToken(user);
    user.isLoggedIn = true;
    await this.repo.save(user);
    return token;
  }

  async logout(user: User): Promise<boolean> {
    user.isLoggedIn = false;
    await this.repo.save(user);
    return true;
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findFiltered(filter?: string): Promise<User[]> {
    console.log('user filter: ' + filter)
    if (!filter) {
      return await this.findAll();
    }
    const f = "%" + filter + "%";
    const res = await this.repo.createQueryBuilder("u")
      .where("u.name LIKE :f", {f: f})
      .orWhere("u.email LIKE :f", {f: f})
      .orWhere("u.role LIKE :f", {f: f})
      .orWhere("u.email LIKE :f", {f: f})
      .orWhere("u.phone LIKE :f", {f: f})
      .orWhere("u.username LIKE :f", {f: f})
      .getMany();
    console.log('result: ' + JSON.stringify(res));
    return res;
  }

  findOne(id: string): Promise<User> {
    return this.repo.findOne(id);
  }

  async doesUsernameExist(username: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {username: username}});
    return !!(u);
  }

  async doesEmailExist(email: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {email: email}});
    return !!(u);
  }

  async findActiveUser(id: string): Promise<User> {
    return this.repo.findActive(id);
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
      throw new UnauthorizedException('No such user.');
    }
    this.mailerService.passwordReset(u, u.setRandomPassword());
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
      const message = "Received a user update without a user id!";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    // we do not update passwords this way...
    Object.assign(u, dto);
    return this.repo.save(u);
  }

  async activate(dto: UserDTO): Promise<User> {
    if (!dto.id) {
      const message = "Received a user update without a user id!";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isActive = true;
    return this.repo.save(u);
  }

  async deactivate(dto: UserDTO): Promise<User> {
    if (!dto.id) {
      const message = "Received a user update without a user id!";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isActive = false;
    u.isLoggedIn = false;
    return this.repo.save(u);
  }

  async forceLogout(dto: UserDTO): Promise<User> {
    if (!dto.id) {
      const message = "Received a user update without a user id!";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isLoggedIn = false;
    return this.repo.save(u);
  }

  async validateUserByPassword(username: string, pass: string): Promise<User> {
    const user = await this.findByUserName(username);
    if (user && user.validatePassword(pass)) {
      // Note we return the user with encrypted password and salt. We could remove those here.
      // However, the user is ultimately returned with ClassSerializerInterceptor which applies
      // the @Exclude annotation on these fields.  So bottom line, they do not get exported.
      return user;
    }
    return null;
  }

  async changePassword(u: User, dto: UserPasswordChangeDTO): Promise<string> {
    if (!u.validatePassword(dto.currentPassword)) {
      const message = 'Attempted password change for ' + u.username + ' with incorrect current password';
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    u.setPassword(dto.newPassword);
    await this.repo.save(u);
    return this.buildToken(u);
  }

  async delete(id: string): Promise<any> {
    const u: User = await this.repo.findOneOrFail(id);
    return await this.repo.remove(u);
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return await this.repo.findOne({where: {username: username}});
  }

  buildToken(user: User): string {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      passwordChangeRequired: user.passwordChangeRequired
    };
    return this.jwtService.sign(payload);
  }

}
