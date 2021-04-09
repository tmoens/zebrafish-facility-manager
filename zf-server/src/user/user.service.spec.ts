import {Test} from '@nestjs/testing';
import {UserService} from './user.service';
import * as winston from 'winston';
import {Logger} from 'winston';
import {ConfigService} from '../config/config.service';
import {Connection} from 'typeorm';
import {utilities as nestWinstonModuleUtilities} from 'nest-winston/dist/winston.utilities';
import {ConfigModule} from '../config/config.module';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from 'nest-winston';
import {UserRepository} from './user.repository';
import {User} from './user.entity';
import {UserDTO, UserPasswordChangeDTO} from '../common/user/UserDTO';
import {random_password_generate} from '../helpers/pasword-generator';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {MailerModule, MailerService} from '@nestjs-modules/mailer';
import {PassportModule} from '@nestjs/passport';
import {ZFMailerService} from '../mailer/mailer-service';
import {StockRepository} from '../stock/stock.repository';
import {Stock} from '../stock/stock.entity';

// TODO - there are no tests for the user queries

describe('User Testing', () => {
  let userService: UserService;
  let logger: Logger;
  let repo: UserRepository;
  let stockRepo: StockRepository;
  let jwtService: JwtService;
  let mailerService: MailerService;
  let zfMailer: ZFMailerService;
  let configService: ConfigService;
  let connection: Connection;
  let testName: string;
  const consoleLog = new (winston.transports.Console)({
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike(),
    ),
  });
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync(
          {
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        TypeOrmModule.forFeature([Stock, StockRepository, User, UserRepository]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
        }),
        MailerModule.forRootAsync(
          {
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.jwtSecret,
            signOptions: {expiresIn: configService.jwtDuration},
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        UserRepository,
        {
          provide: getCustomRepositoryToken(User),
          useExisting: UserRepository,
        }],
    }).compile();
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    configService = new ConfigService();
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
    zfMailer = new ZFMailerService(mailerService, configService);
    connection = module.get(Connection);
    repo = module.get<UserRepository>(UserRepository);
    stockRepo = module.get<StockRepository>(StockRepository);
    userService = new UserService(repo, stockRepo, logger, jwtService, zfMailer, configService);

  });


  describe( '46893425 user crud', () => {

    it('18418432 user create (and fetch and delete)', async () => {
      const dto1: UserDTO = {
        username: 'fred.flintstone',
        name: 'Fred Flintstone',
        email: 'fred.flintstone@nomail.com',
        initials: 'FWF',
        role: 'guest',
        isPrimaryInvestigator: true,
        isResearcher: true,
        isActive: false,
      };
      let user1: User = await userService.create(dto1);
      // look it up again
      user1 = await userService.findOne(user1.id);
      expect(user1.username).toBe(dto1.username);
      expect(user1.name).toBe(dto1.name);
      expect(user1.email).toBe(dto1.email);
      expect(user1.initials).toBe(dto1.initials);
      expect(user1.isActive).toBe(dto1.isActive);
      expect(user1.isResearcher).toBe(dto1.isResearcher);
      expect(user1.isPrimaryInvestigator).toBe(dto1.isPrimaryInvestigator);
      expect(user1.role).toBe(dto1.role);
      await userService.delete(user1.id);
    });

    testName = '1951263 cant delete active user';
    it(testName, async () => {
      const dto1: UserDTO = {
        username: 'fred.flintstone',
        name: 'Fred Flintstone',
        email: 'fred.flintstone@nomail.com',
        initials: 'FWF',
        isActive: true,
      };
      let user1: User = await userService.create(dto1);
      // look it up again
      user1 = await userService.findOne(user1.id);
      // cant delete active user
      await expect(userService.delete(user1.id)).rejects.toThrow();
      // deactivate it so it can be deleted
      user1 = await userService.deactivate(user1);
      await userService.delete(user1.id);
    });

    testName = '1430550 Activate/Deactivate user';
    it(testName, async () => {
      const dto1: UserDTO = {
        username: 'fred.flintstone',
        name: 'Fred Flintstone',
        email: 'fred.flintstone@nomail.com',
        initials: 'FWF',
      };
      let user1: User = await userService.create(dto1);
      user1 = await userService.findOne(user1.id);
      expect(user1.isActive).toBe(true);
      user1 = await userService.deactivate(user1);
      expect(user1.isActive).toBe(false);
      user1 = await userService.activate(user1);
      expect(user1.isActive).toBe(true);
      // have to deactivate once again in order to delete.
      user1 = await userService.deactivate(user1);
      await userService.delete(user1.id);
    });

    it('88913679 user update', async () => {
      const dto: UserDTO = {
        email: '88913679@gmail.com',
        name: 'fred',
        username: '88913679',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      dto.id = u.id;
      dto.isActive = false;
      dto.email = "88913679@hotmail.com";
      dto.name = "barney";
      dto.phone = "1234-78";
      dto.role = "user";
      dto.username = "88913679change";
      const u2 = await userService.update(dto);
      expect(u2.email).toBe(dto.email);
      expect(u2.isActive).toBe(dto.isActive);
      expect(u2.name).toBe(dto.name);
      expect(u2.phone).toBe(dto.phone);
      expect(u2.role).toBe(dto.role);
      expect(u2.username).toBe(dto.username);
      await userService.delete(u2.id);
    });

    it('94748756 user update with sparse dto', async () => {
      const dto: UserDTO = {
        email: '94748756@gmail.com',
        name: 'fred',
        username: '94748756',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      const updateDto = {
        id: u.id,
        email: 'newEmail@gmail.com',
      };
      const u2 = await userService.update(updateDto);
      expect(u2.email).toBe(updateDto.email);
      await userService.delete(u2.id);
    });

    it('50081088 user update with goofy id', async () => {
      const dto: UserDTO = {
        email: '50081088@gmail.com',
        name: 'fred',
        username: '50081088',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      const updateDto = {
        id: 'not a valid id at all',
        email: 'newEmail@gmail.com',
        initials: 'ABC',
      };
      await expect(userService.update(updateDto)).rejects.toThrow();
      await userService.delete(u.id);
    });

    it('37185508 user update with no id', async () => {
      const dto: UserDTO = {
        email: '37185508@gmail.com',
        name: 'fred',
        username: '37185508',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      const updateDto = {
        email: 'newEmail@gmail.com',
      };
      await expect(userService.update(updateDto)).rejects.toThrow();
      await userService.delete(u.id);
    });

    it('99618999 change password with bad oldPassword', async () => {
      const dto: UserDTO = {
        email: '99618999@gmail.com',
        name: 'fred',
        username: '99618999',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      const d: UserPasswordChangeDTO = {
        currentPassword: 'wrong',
        newPassword: 'whatever',
        repeatNewPassword: 'whatever',
      };
      await expect(userService.changePassword(u, d)).rejects.toThrow();
      await userService.delete(u.id);
    });

    it('34555782 change password', async () => {
      const dto: UserDTO = {
        email: '34555782@gmail.com',
        name: 'fred',
        username: '34555782',
        initials: 'ABC',
        isActive: false,
      };
      const u: User = await userService.create(dto);
      // at this point we do ot know what the password is, so we have to set it
      // but we play mucky maulers by calling the repo to do that.
      const newPass = random_password_generate(12);
      u.setPassword(newPass);
      const u2: User = await repo.save(u);
      // now check password validation
      expect(u2.validatePassword(newPass)).toBeTruthy();

      // So far so good, now that we know the user's password, do a proper change password

      const d: UserPasswordChangeDTO = {
        currentPassword: newPass,
        newPassword: 'whatever',
        repeatNewPassword: 'whatever',
      };
      await (userService.changePassword(u2, d));
      const u3: User = await userService.findOne(u2.id);
      expect(u3.validatePassword('whatever')).toBeTruthy();
      await userService.delete(u3.id);
    });

    it('40937122 easy reset password', async () => {
      const dto: UserDTO = {
        email: '40937122@gmail.com',
        name: 'fred',
        username: '40937122',
        initials: 'ABC',
        isActive: false,
      };
      await userService.create(dto);
      const u1: User = await userService.resetPassword({usernameOrEmail: '40937122'});
      expect(u1.passwordChangeRequired).toBeTruthy();
      const u2: User = await userService.resetPassword({usernameOrEmail: '40937122@gmail.com'});
      expect(u2.passwordChangeRequired).toBeTruthy();
      await expect(userService.resetPassword({usernameOrEmail: 'wrong'})).rejects.toThrow();
      await userService.delete(u2.id);
    });

    it('83507465 hard reset password', async () => {
      const dto: UserDTO = {
        email: '83507465@gmail.com',
        name: 'fred',
        username: '83507465',
        initials: 'ABC',
        isActive: false,
      };
      let u: User = await userService.create(dto);
      // The fresh user has to change it's password.  Change that.
      u.passwordChangeRequired = false;
      u = await repo.save(u);
      expect(u.passwordChangeRequired).toBeFalsy();

      // This time, we will play mucky maulers and reset the user's password going via the repo so
      // that we can learn the new random password.
      // this bypasses the userService's check of the current password, but otherwise is the same as "reset password"
      const randomPassword = u.setRandomPassword();
      const u2: User = await repo.save(u);
      expect(u2.passwordChangeRequired).toBeTruthy();
      expect(u2.validatePassword(randomPassword)).toBeTruthy();

      // now if we change the password, the user should not have the passwordChangeRequired flag on
      const d: UserPasswordChangeDTO = {
        currentPassword: randomPassword,
        newPassword: 'whatever',
        repeatNewPassword: 'whatever',
      };
      await (userService.changePassword(u2, d));
      const u3: User = await userService.findOne(u2.id);
      expect(u3.validatePassword('whatever')).toBeTruthy();
      expect(u3.passwordChangeRequired).toBeFalsy();
      await userService.delete(u.id);
    });
  });

  afterAll(async () => {
    await connection.close();
  });
});
