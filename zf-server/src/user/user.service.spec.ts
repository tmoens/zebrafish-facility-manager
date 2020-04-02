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
        id: u.id,
        oldPassword: 'wrong',
        newPassword: 'whatever',
      };
      await expect(service.changePassword(d)).rejects.toThrow();
      await service.delete(classToPlain(u));
    });

    // Cannot really automate testing of reset or password change because there is no
    // way to automate the creation of a user with a known password - by design.  So
    // need to test this through the manual reset password mechanism.

  });
});
