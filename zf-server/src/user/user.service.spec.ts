import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {Logger} from "winston";
import {ConfigService} from "../config/config.service";
import {Connection} from "typeorm";
import {utilities as nestWinstonModuleUtilities} from "nest-winston/dist/winston.utilities";
import {ConfigModule} from "../config/config.module";
import {getCustomRepositoryToken, TypeOrmModule} from "@nestjs/typeorm";
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from "nest-winston";
import {UserRepository} from "./user.repository";
import {User} from "./user.entity";
import {UserDTO, UserPasswordChangeDTO} from "../common/user/UserDTO";
import * as winston from "winston";
import {classToPlain} from "class-transformer";
import {random_password_generate} from "../helpers/pasword-generator";

describe('UserService', () => {
  let service: UserService;
  let logger: Logger;
  let repo: UserRepository;
  let configService: ConfigService;
  let connection: Connection;
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
        TypeOrmModule.forFeature([User, UserRepository]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
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
    connection = module.get(Connection);
    repo = module.get<UserRepository>(UserRepository);
    service = new UserService(repo, logger);

  });


  describe( '46893425 user crud', () => {

    it('18418432 user create (and fetch and delete)', async () => {
      const dto: UserDTO = {
        username: "18418432",
        name: "fred",
        email: "18418432@gmail.com",
      };
      const u: User = await service.create(dto);
      expect(u.username).toBe(dto.username);
      const newId = u.id;
      const u2: User = await service.findOne(newId);
      expect(u2.username).toBe(u.username);
      await service.delete(classToPlain(u));
      const u3: User = await service.findOne(newId);
      expect(u3).toBeUndefined();
    });

    it('88913679 user update', async () => {
      const dto: UserDTO = {
        email: "88913679@gmail.com",
        name: "fred",
        username: "88913679",
      };
      const u: User = await service.create(dto);
      dto.id = u.id;
      dto.isActive = false;
      dto.email = "88913679@hotmail.com";
      dto.name = "barney";
      dto.phone = "1234-78";
      dto.role = "user";
      dto.username = "88913679change";
      const u2 = await service.update(dto);
      expect(u2.email).toBe(dto.email);
      expect(u2.isActive).toBe(dto.isActive);
      expect(u2.name).toBe(dto.name);
      expect(u2.phone).toBe(dto.phone);
      expect(u2.role).toBe(dto.role);
      expect(u2.username).toBe(dto.username);
      await service.delete(classToPlain(u));
    });

    it('94748756 user update with sparse dto', async () => {
      const dto: UserDTO = {
        email: "94748756@gmail.com",
        name: "fred",
        username: "94748756",
      };
      const u: User = await service.create(dto);
      const updateDto = {
        id: u.id,
        email: 'newEmail@gmail.com',
      };
      const u2 = await service.update(updateDto);
      expect(u2.email).toBe(updateDto.email);
      await service.delete(classToPlain(u));
    });

    it('50081088 user update with goofy id', async () => {
      const dto: UserDTO = {
        email: "50081088@gmail.com",
        name: "fred",
        username: "50081088",
      };
      const u: User = await service.create(dto);
      const updateDto = {
        id: "not a valid id at all",
        email: 'newEmail@gmail.com',
      };
      await expect(service.update(updateDto)).rejects.toThrow();
      await service.delete(classToPlain(u));
    });

    it('37185508 user update with no id', async () => {
      const dto: UserDTO = {
        email: "37185508@gmail.com",
        name: "fred",
        username: "37185508",
      };
      const u: User = await service.create(dto);
      const updateDto = {
        email: 'newEmail@gmail.com',
      };
      await expect(service.update(updateDto)).rejects.toThrow();
      await service.delete(classToPlain(u));
    });

    it('99618999 change password with bad oldPassword', async () => {
      const dto: UserDTO = {
        email: "99618999@gmail.com",
        name: "fred",
        username: "99618999",
      };
      const u: User = await service.create(dto);
      const d: UserPasswordChangeDTO = {
        currentPassword: 'wrong',
        newPassword: 'whatever',
        repeatNewPassword: 'whatever',
      };
      await expect(service.changePassword(u, d)).rejects.toThrow();
      await service.delete(classToPlain(u));
    });

    it('34555782 change password', async () => {
      const dto: UserDTO = {
        email: "34555782@gmail.com",
        name: "fred",
        username: "34555782",
      };
      const u: User = await service.create(dto);
      // at this point we do ot know what the password is, so we have to set it
      // but we play mucky maulers by calling the repo to do that.
      const newPass = random_password_generate(12);
      u.setPassword(newPass);
      const u2: User = await repo.save(u);
      // now check password validation
      expect(u2.validatePassword(newPass)).toBeTruthy();

      // So far so good, now that we kow the user's password, do a proper change password

      const d: UserPasswordChangeDTO = {
        currentPassword: newPass,
        newPassword: 'whatever',
        repeatNewPassword: 'whatever',
      };
      const u3: User = await (service.changePassword(u2, d));
      expect(u3.validatePassword('whatever')).toBeTruthy();
      await service.delete(classToPlain(u3));
    });

    it('40937122 easy reset password', async () => {
      const dto: UserDTO = {
        email: "40937122@gmail.com",
        name: "fred",
        username: "40937122",
      };
      const u: User = await service.create(dto);
      const u1: User = await service.resetPassword({usernameOrEmail: '40937122'});
      expect(u1.passwordChangeRequired).toBeTruthy();
      const u2: User = await service.resetPassword({usernameOrEmail: '40937122@gmail.com'});
      expect(u2.passwordChangeRequired).toBeTruthy();
      await expect(service.resetPassword({usernameOrEmail: 'wrong'})).rejects.toThrow();
      await service.delete(classToPlain(u2));
    });

    it('83507465 hard reset password', async () => {
      const dto: UserDTO = {
        email: "83507465@gmail.com",
        name: "fred",
        username: "83507465",
      };
      let u: User = await service.create(dto);
      // The fresh user has to change it's password.  Change that.
      u.passwordChangeRequired = false;
      await repo.save(u);
      expect(u.passwordChangeRequired).toBeFalsy();

      // This time, we will play mucky maulers and reset the user's password going via the repo so
      // that we can learn the new random password.
      // this bypasses the service's check of the current password, but otherwise is the same as "reset password"
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
      const u3: User = await (service.changePassword(u2, d));
      expect(u3.validatePassword('whatever')).toBeTruthy();
      expect(u3.passwordChangeRequired).toBeFalsy();
      await service.delete(classToPlain(u));
    });

  });
});
