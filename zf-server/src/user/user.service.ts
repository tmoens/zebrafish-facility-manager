import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './user.entity';
import {plainToClass} from 'class-transformer';
import {ResetPasswordDTO, UserDTO, UserPasswordChangeDTO} from '../common/user/UserDTO';
import {Logger} from 'winston';
import {ADMIN_ROLE} from '../common/auth/zf-roles';
import {JwtService} from '@nestjs/jwt';
import {UserRepository} from './user.repository';
import {ZFMailerService} from '../mailer/mailer-service';
import {ConfigService} from '../config/config.service';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {UserFilter} from './user-filter';
import {Brackets, SelectQueryBuilder} from 'typeorm';
import {StockRepository} from '../stock/stock.repository';
import {GenericService} from '../Generics/generic-service';

@Injectable()
export class UserService extends GenericService {
  constructor(
    @InjectRepository(UserRepository) private readonly repo: UserRepository,
    @InjectRepository(StockRepository) private readonly stockRepo: StockRepository,
    @Inject('winston') private readonly logger: Logger,
    private jwtService: JwtService,
    private mailerService: ZFMailerService,
    private configService: ConfigService,
  ) {
    super(logger);
    this.makeSureAdminExists().then();
  }

  // When a system starts up, it needs at least one user.
  // If it is missing, we create one according to the settings in the config file.
  // The account is set up so that the user must change her password when
  // she first logs in.
  async makeSureAdminExists() {
    if (!await this.findByUserName(this.configService.defaultAdminUserName)) {
      const admin: User = await this.create({
        username: this.configService.defaultAdminUserName,
        name: this.configService.defaultAdminUserName,
        initials: 'ZFM',
        role: ADMIN_ROLE,
        email: this.configService.defaultAdminUserEmail
      });
      admin.setPassword(this.configService.defaultAdminUserPassword);
      admin.passwordChangeRequired = true;
      await this.repo.save(admin);
    }
  }

  //====================== Operations =====================
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

  async findByUserName(username: string): Promise<User | undefined> {
    return await this.repo.findOne({where: {username: username}});
  }

  //====================== Searches =====================
  async findAll(): Promise<User[]> {
    return this.repo.find({order: {'email': 'ASC'}});
  }

  async findOne(id: string): Promise<User> {
    const u = await this.repo.findOne(id);
    u.isDeletable = await this.isDeletable(u);
    return u;
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    return await this.repo.findOne({
      where: [
        {username: usernameOrEmail},
        {email: usernameOrEmail},
      ],
    });
  }

  async findActiveUser(id: string): Promise<User> {
    return this.repo.findOne({where: {id: id, isActive: true}});
  }

  async findFiltered(filter: UserFilter): Promise<User[]> {
    let q: SelectQueryBuilder<User> = this.repo.createQueryBuilder('user')
      .where('1');
    if (filter.activeOnly) {
      q = q.andWhere('user.isActive = :active', {active: true});
    }
    if (filter.inactiveOnly) {
      q = q.andWhere('user.isActive = :inactive', {inactive: false});
    }
    if (filter.piOnly) {
      q = q.andWhere('user.isPrimaryInvestigator = :pi', {pi: true});
    }
    if (filter.researcherOnly) {
      q = q.andWhere('user.isResearcher = :researcher', {researcher: true});
    }
    if (filter.isLoggedIn) {
      q = q.andWhere('user.isLoggedIn = :loggedIn', {loggedIn: true});
    }
    if (filter.text) {
      const textFilter: string = '%' + filter.text + '%';
      q = q.andWhere(new Brackets(qb => {
        qb.where("user.name LIKE :f", {f: textFilter})
          .orWhere("user.email LIKE :f", {f: textFilter})
          .orWhere("user.role LIKE :f", {f: textFilter})
          .orWhere("user.phone LIKE :f", {f: textFilter})
          .orWhere("user.initials LIKE :f", {f: textFilter})
          .orWhere("user.username LIKE :f", {f: textFilter})

      }))
    }
    q = q.orderBy('user.email');
    return await q.getMany();
  }

  async findUsers(userType: string): Promise<UserDTO[]> {
    let q: SelectQueryBuilder<User> = this.repo.createQueryBuilder('user')
      .orderBy('user.name');

    if (userType === 'ACTIVE_PRIMARY_INVESTIGATOR') {
      // users who are designated as PIs AND who are active
      q = q.where('user.isActive')
        .andWhere('user.isPrimaryInvestigator');

    } else if (userType === 'ACTIVE_RESEARCHER') {
      // users who are designated as researchers AND who are active
      q = q.where('user.isActive')
        .andWhere('user.isResearcher');

    } else if (userType === 'EXTANT_RESEARCHER') {
      // users who are associated as researchers for at lest one stock
      q = q.innerJoin('stock', 'stock', 'user.id = stock.researcherId')
        .groupBy('user.id');

    } else if (userType === 'EXTANT_PRIMARY_INVESTIGATOR') {
      // users who are associated as researchers for at lest one stock
      q = q.innerJoin('stock', 'stock', 'user.id = stock.piId')
        .groupBy('user.id');
    } else {
      return [];
    }
    return await q.getMany();
  }

  //================== Atomic Validation Checks ==================
  // A user cannot be deleted if active or if any stocks refer to it.
  async isDeletable(user: User): Promise<boolean> {
    if (user.isActive) {
      return false;
    }
    const res = await this.stockRepo.createQueryBuilder('s')
      .select('1')
      .where('researcherId = :rid', {rid: user.id})
      .orWhere('piId = :pid', {pid: user.id})
      .getRawOne();

    return (!res);
  }

  async doesUsernameExist(username: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {username: username}});
    return !!(u);
  }

  async doesNameExist(name: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {name: name}});
    return !!(u);
  }

  async doesInitialsExist(initials: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {initials: initials}});
    return !!(u);
  }

  async doesEmailExist(email: string): Promise<boolean> {
    const u: User = await this.repo.findOne({where: {email: email}});
    return !!(u);
  }

  //========================== Creation ==================
  async create(dto: UserDTO): Promise<User> {
    convertEmptyStringToNull(dto);
    this.ignoreAttribute(dto, 'id');
    const candidate: User = plainToClass(User, dto);
    await this.validateForCreate(candidate);
    const newPassword = candidate.setRandomPassword();
    console.log('Setting random password for ' + candidate.username + ': ' + newPassword);
    this.mailerService.newUser(candidate, newPassword);
    return this.repo.save(candidate);
  }

  async import(dto: UserDTO): Promise<User> {
    convertEmptyStringToNull(dto);
    this.ignoreAttribute(dto, 'id');
    const candidate: User = plainToClass(User, dto);
    await this.validateForCreate(candidate);
    const newPassword = candidate.setRandomPassword();
    console.log('Setting random password for ' + candidate.username + ': ' + newPassword);
    return this.repo.save(candidate);
  }

  // TODO syntactical checks for length and valid e-mail etc.
  async validateForCreate(user: UserDTO): Promise<boolean> {
    const errors: string[] = [];

    // user's name is required and must be unique
    if (!user.name) {
      errors.push('no "name" field');
    } else if (await this.doesNameExist(user.name)) {
      errors.push(`name "${user.name}" is already in use.`);
    }

    // user's username is required and must be unique
    if (!user.username) {
      errors.push('no "username" field');
    } else if (await this.doesUsernameExist(user.username)) {
      errors.push(`username "${user.username}" is already in use.`);
    }

    // user's e-mail is required and must be unique
    if (!user.email) {
      errors.push('no "email" field');
    } else if (await this.doesEmailExist(user.email)) {
      errors.push(`email "${user.email}" is already in use.`);
    }

    // user's initials are required and must be unique
    if (!user.initials) {
      errors.push('no "initials" field');
    } else if (await this.doesInitialsExist(user.initials)) {
      errors.push(`initials "${user.initials}" is already in use.`);
    }

    if (errors.length > 0) {
      this.logAndThrowException(errors.join("; "));
    }
    return true;
  }

  //========================== Update ==================
  async resetPassword(dto: ResetPasswordDTO): Promise<User> {
    const u: User = await this.findByUsernameOrEmail(dto.usernameOrEmail);
    if (!u) {
      throw new UnauthorizedException('No such user.');
    }
    this.mailerService.passwordReset(u, u.setRandomPassword());
    return this.repo.save(u);
  }

  // TODO Validate for Update
  async update(dto: UserDTO): Promise<User> {
    convertEmptyStringToNull(dto)
    if (!dto.id) {
      this.logAndThrowException("Received a user update without a user id!");
    }
    const u: User = await this.repo.findOneOrFail(dto.id);
    // we do not update passwords this way...
    Object.assign(u, dto);
    return this.repo.save(u);
  }

  async activate(dto: UserDTO): Promise<User> {
    this.mustHaveAttribute(dto, 'id');
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isActive = true;
    return this.repo.save(u);
  }

  async deactivate(dto: UserDTO): Promise<User> {
    this.mustHaveAttribute(dto, 'id');
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isActive = false;
    u.isLoggedIn = false;
    return this.repo.save(u);
  }

  async forceLogout(dto: UserDTO): Promise<User> {
    this.mustHaveAttribute(dto, 'id');
    const u: User = await this.repo.findOneOrFail(dto.id);
    u.isLoggedIn = false;
    return this.repo.save(u);
  }

  async changePassword(u: User, dto: UserPasswordChangeDTO): Promise<string> {
    if (!u.validatePassword(dto.currentPassword)) {
      this.logAndThrowException(
        'Attempted password change for ' + u.username + ' with incorrect current password');
    }
    u.setPassword(dto.newPassword);
    await this.repo.save(u);
    return this.buildToken(u);
  }

  //========================== Delete ==================
  async delete(id: string): Promise<any> {
    const u: User = await this.findOne(id);

    if (!u || !(await this.isDeletable(u))) {
      this.logAndThrowException('Tried to delete a user you shouldn\'t have been able to!');
    }
    return await this.repo.remove(u);
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
