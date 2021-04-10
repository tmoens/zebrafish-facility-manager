import {Test} from '@nestjs/testing';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from './config/config.module';
import {ConfigService} from './config/config.service';
import {Connection} from 'typeorm';
import {TransgeneRepository} from './transgene/transgene.repository';
import {Transgene} from './transgene/transgene.entity';
import {Stock} from './stock/stock.entity';
import {StockRepository} from './stock/stock.repository';
import {StockService} from './stock/stock.service';
import {MutationRepository} from './mutation/mutation.repository';
import {Mutation} from './mutation/mutation.entity';
import * as winston from 'winston';
import {Logger} from 'winston';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from 'nest-winston';
import {utilities as nestWinstonModuleUtilities} from 'nest-winston/dist/winston.utilities';
import {TransgeneService} from './transgene/transgene.service';
import {MutationService} from './mutation/mutation.service';
import {ZfinService} from './zfin/zfin.service';
import {UserService} from './user/user.service';
import {StockImportDto} from './stock/stock-import-dto';
import {UserDTO} from './common/user/UserDTO';
import {User} from './user/user.entity';
import {UserRepository} from './user/user.repository';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {MailerModule, MailerService} from '@nestjs-modules/mailer';
import {PassportModule} from '@nestjs/passport';
import {ZFMailerService} from './mailer/mailer-service';

describe('Import testing', () => {
  let logger: Logger;
  let testName: string;
  let stockService: StockService;
  let userRepo: UserRepository;
  let userService: UserService;
  let jwtService: JwtService;
  let mailerService: MailerService;
  let zfMailer: ZFMailerService;
  let mutationRepo: MutationRepository;
  let mutationService: MutationService;
  let transgeneRepo: TransgeneRepository;
  let transgeneService: TransgeneService;
  let zfinService: ZfinService;
  let stockRepo: StockRepository;
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
        TypeOrmModule.forFeature([
          Stock, StockRepository,
          Mutation, MutationRepository,
          Transgene, TransgeneRepository,
          User, UserRepository,
        ]),
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
        StockRepository,
        {
          provide: getCustomRepositoryToken(Stock),
          useExisting: StockRepository,
        }],
    }).compile();
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    configService = new ConfigService();
    zfinService = new ZfinService();
    connection = module.get(Connection);
    stockRepo = module.get<StockRepository>(StockRepository);
    mutationRepo = module.get<MutationRepository>(MutationRepository);
    transgeneRepo = module.get<TransgeneRepository>(TransgeneRepository);
    userRepo = module.get<UserRepository>(UserRepository);
    mutationService = new MutationService(logger, configService, mutationRepo, transgeneRepo, zfinService);
    transgeneService = new TransgeneService(logger, configService, transgeneRepo, mutationRepo, zfinService);
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
    userService = new UserService(userRepo, stockRepo, logger, jwtService, zfMailer, configService);
    stockService = new StockService(logger, configService, stockRepo, userService, mutationService, transgeneService);

  });

  describe('6960271 Import', () => {

    //====================== Import Stocks ===============================
    describe('4947276 Import stock', () => {

      testName = '9059821 import and delete minimal stock';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4444),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '4321544 import and delete minimal stock with nonsense field';
      it(testName, async () => {
        const s: any = {
          name: String(4445),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
          gnerp: 'gnerp',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        // await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '4831332 import a stock with no name';
      it(testName, async () => {
        const s: StockImportDto = {
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '6090642 import a stock with no fertilization date';
      it(testName, async () => {
        const s: StockImportDto = {
          description: String(Math.random()),
          comment: testName,
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '1435005 import a stock with bad name';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4302.2),
          description: String(Math.random()),
          comment: testName,
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '6235538 import existing stock name';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4302.02),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        await expect(stockService.import(s)).rejects.toThrow();
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '8551463 import stock with conflicting parental information ';
      it(testName, async () => {
        const momDto: StockImportDto = {
          name: String(4400),
          description: String(Math.random()),
          comment: 'mom ' + testName,
          fertilizationDate: '2019-01-01',
        };
        const mom: Stock = await stockService.import(momDto);
        const dadDto: StockImportDto = {
          name: String(4401),
          description: String(Math.random()),
          comment: 'dad ' + testName,
          fertilizationDate: '2019-01-01',
        };
        const dad: Stock = await stockService.import(dadDto);
        const kidDto: StockImportDto = {
          name: String(4702),
          internalDad: String(4401),
          internalMom: String(4400),
          externalMomName: 'conflicts with internal Mom',
          externalMomDescription: 'conflicts with internal Mom',
          externalDadName: 'conflicts with internal Dad',
          externalDadDescription: 'conflicts with internal Dad',
          description: String(Math.random()),
          comment: 'conflicted kid',
        };
        await expect(stockService.import(kidDto)).rejects.toThrow();
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });
    });

    //====================== Import Sub-Stocks ===============================
    describe('5953656 Import sub-stock', () => {

      const baseStockDto: StockImportDto = {
        name: String(3000),
        description: `base stock 3000`,
        fertilizationDate: '2019-01-01',
        comment: 'importing substocks'
      };
      let baseStock: Stock;

      beforeAll(async () => {
        baseStock = await stockService.import(baseStockDto);
      });

      testName = '2204333 import and delete minimal sub-stock';
      it(testName, async () => {
        const ssDto: StockImportDto = {
          name: String(3000.01),
          description: String(Math.random()),
          fertilizationDate: '2019-01-01',
          comment: testName,
        };
        const ss: Stock = await stockService.import(ssDto);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(ss.id);
        expect(retrievedStock.description).toBe(ssDto.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '2204333 import and delete minimal sub-stock with no base stock';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(3321.02),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '2204333 import sub-stock various attr mismatches';
      it(testName, async () => {
        const ssDto: StockImportDto = {
          name: String(3000.03),
          description: String(Math.random()),
          fertilizationDate: '2019-01-02',
          comment: testName,
          externalMomName: 'wilma',
          externalMomDescription: 'tall thin redhead',
          externalDadName: 'fred',
          externalDadDescription: 'lovable dummy',
        };
        await expect(stockService.import(ssDto)).rejects.toThrow();
      });


      afterAll(async () => {
        await stockService.validateAndRemove(baseStock.id);
      });
    });

    //====================== Import Mutations ===============================
    describe('6645201 Import mutation', () => {
      testName = '5641327 no name';
      it(testName, async () => {
        const dto = {
          gene: 'test',
          phenotype: String(Math.random()),
          comment: testName,
        };
        await expect(mutationService.import(dto)).rejects.toThrow();
      });

      testName = '4109440 import and delete minimal mutation';
      it(testName, async () => {
        const dto = {
          name: 'fred',
          gene: 'barney',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4273919 import and delete minimal mutation that is known to ZFIN';
      it(testName, async () => {
        const dto = {
          name: 'fh273',
          gene: 'msgn1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.zfinId).toBe('ZDB-ALT-080325-5');
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '7855585 import and delete minimal mutation that is known to ZFIN, wrong gene name';
      it(testName, async () => {
        const dto = {
          name: 'sw40',
          gene: 'wrongo',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.zfinId).toBe('ZDB-ALT-111220-1');
        expect(mut.gene).toBe('bmpr1bb');
        expect(mut.alternateGeneName).toBe(dto.gene);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4179948 import with nickname';
      it(testName, async () => {
        const dto = {
          name: 'test',
          gene: 'test',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.nickname).toBe(dto.nickname);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '7131086 import with duplicate nickname';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test2',
          gene: 'test2',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto1);
        await expect(mutationService.import(dto2)).rejects.toThrow();
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '1162941 import with duplicate name';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test1',
          gene: 'test2',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto1);
        await expect(mutationService.import(dto2)).rejects.toThrow();
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '1660116 import with serial number & duplicate';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          serialNumber: 14,
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test2',
          gene: 'test2',
          serialNumber: 14,
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto1);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto1.phenotype);
        expect(mut.serialNumber).toBe(dto1.serialNumber);
        await expect(mutationService.import(dto2)).rejects.toThrow();
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4610472 duplicate gene name ok';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test2',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut1: Mutation = await mutationService.import(dto1);
        let mut2: Mutation = await mutationService.import(dto2);
        await mutationService.validateAndRemove(mut1.id);
        await mutationService.validateAndRemove(mut2.id);
      });
    });

    //====================== Import Transgenes ===============================
    describe('6645201 Import transgenes', () => {

      testName = '4888462 no allele name';
      it(testName, async () => {
        const dto = {
          descriptor: 'barney',
          source: String(Math.random()),
          comment: testName,
        };
        await expect(transgeneService.import(dto)).rejects.toThrow();
      });

      testName = '3026204 no descriptor name, unknown to ZFIN';
      it(testName, async () => {
        const dto = {
          allele: 'imaginary',
          source: String(Math.random()),
          comment: testName,
        };
        await expect(transgeneService.import(dto)).rejects.toThrow();
      });

      testName = '7625328 import and delete minimal transgene';
      it(testName, async () => {
        const dto = {
          allele: 'fred',
          descriptor: 'barney',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.source).toBe(dto.source);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '7324247 import and delete minimal transgene that is known to ZFIN';
      it(testName, async () => {
        const dto = {
          allele: 'y1Tg',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        // the next two fields are filled in by a call to the ZFIN DB.
        expect(tg.descriptor).toBe('Tg(fli1:EGFP)');
        expect(tg.zfinId).toBe('ZDB-ALT-011017-8');
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '8855585 import and delete minimal transgene that is known to ZFIN, wrong descriptor';
      it(testName, async () => {
        const dto = {
          allele: 'y1Tg',
          descriptor: 'wrongo',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.nickname).toBe(`${dto.descriptor}^${dto.allele}`);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '5279948 import with nickname';
      it(testName, async () => {
        const dto = {
          allele: 'test',
          descriptor: 'test',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.descriptor).toBe(dto.descriptor);
        expect(tg.nickname).toBe(dto.nickname);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '8331086 import with duplicate nickname';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test2',
          descriptor: 'test2',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto1);
        await expect(transgeneService.import(dto2)).rejects.toThrow();
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '2362941 import with duplicate name';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test1',
          descriptor: 'test2',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto1);
        await expect(transgeneService.import(dto2)).rejects.toThrow();
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '2760116 import with serial number & duplicate';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          serialNumber: 14,
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test2',
          descriptor: 'test2',
          serialNumber: 14,
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto1);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.descriptor).toBe(dto1.descriptor);
        expect(tg.serialNumber).toBe(dto1.serialNumber);
        await expect(transgeneService.import(dto2)).rejects.toThrow();
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '5510472 duplicate descriptor ok';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test2',
          descriptor: 'test1',
          source: String(Math.random()),
          comment: testName,
        };
        let tg1: Transgene = await transgeneService.import(dto1);
        let tg2: Transgene = await transgeneService.import(dto2);
        await transgeneService.validateAndRemove(tg1.id);
        await transgeneService.validateAndRemove(tg2.id);
      });
    });

    //====================== Import users ===============================
    describe('8808458 Import users', () => {

      testName = '9502805 Good user';
      it(testName, async () => {
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
        let user1: User = await userService.import(dto1);
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

      testName = '9193829 Minimal user';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        let user1: User = await userService.import(dto1);
        user1 = await userService.findOne(user1.id);
        expect(user1.username).toBe(dto1.username);
        expect(user1.name).toBe(dto1.name);
        expect(user1.email).toBe(dto1.email);
        expect(user1.initials).toBe(dto1.initials);
        // Other attributes should be defaults
        expect(user1.isActive).toBe(true);
        expect(user1.isResearcher).toBe(true);
        expect(user1.isPrimaryInvestigator).toBe(false);
        expect(user1.role).toBe('guest');
        // Have to set the user to inactive to delete it
        user1 = await userService.deactivate(user1);
        await userService.delete(user1.id);
      });

      testName = '8796945 Missing name';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '9196945 Missing username';
      it(testName, async () => {
        const dto1: UserDTO = {
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '7796945 Missing email';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '7796945 Missing initials';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '9193829 Duplicate fields';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        const dto2: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        let user1: User = await userService.import(dto1);
        await expect(userService.import(dto2)).rejects.toThrow();
        // Have to set the user to inactive to delete it
        user1 = await userService.deactivate(user1);
        await userService.delete(user1.id);
      });
    });
  });

  //====================== Import Relationships ===============================
  describe('8808458 Import relationships', () => {

    const mut1Dto = {
      name: 'm1',
      gene: 'mg1',
      comment: 'importing relationships'
    };
    const mut2Dto = {
      name: 'm2',
      gene: 'mg2',
      comment: 'importing relationships'
    };

    const tg1Dto = {
      allele: 'tg1',
      descriptor: 'tgD1',
      comment: 'importing relationships'
    }
    const tg2Dto = {
      allele: 'tg2',
      descriptor: 'tgD2',
      comment: 'importing relationships'
    }

    const pi1Dto: UserDTO = {
      username: 'pi1',
      name: 'pi1',
      email: 'upi1@nomail.com',
      initials: 'PIO',
      isResearcher: true,
      isPrimaryInvestigator: true,
    };
    const researcher1Dto: UserDTO = {
      username: 'researcher1',
      name: 'researcher1',
      email: 'researcher1@nomail.com',
      initials: 'RONE',
      isResearcher: true,
      isPrimaryInvestigator: false,
    };
    const researcher2Dto: UserDTO = {
      username: 'researcher2',
      name: 'researcher2',
      email: 'researcher2@nomail.com',
      initials: 'RTWO',
      isResearcher: true,
      isPrimaryInvestigator: false,
    };
    const guestDto: UserDTO = {
      username: 'guest1',
      name: 'guest1',
      email: 'guest1@nomail.com',
      initials: 'GONE',
      isResearcher: false,
      isPrimaryInvestigator: false,
      role: 'guest',
    };

    const baseStockDto: StockImportDto = {
      name: String(4000),
      description: `base stock 4000`,
      fertilizationDate: '2019-01-01',
      comment: 'importing relationships'
    };
    let m1: Mutation;
    let m2: Mutation;
    let tg1: Transgene;
    let tg2: Transgene;
    let pi1: User;
    let researcher1: User;
    let researcher2: User;
    let guest1: User;
    let baseStock: Stock;

    beforeAll(async () => {
      m1 = await mutationService.import(mut1Dto);
      m2 = await mutationService.import(mut2Dto);
      tg1 = await transgeneService.import(tg1Dto);
      tg2 = await transgeneService.import(tg2Dto);
      pi1 = await userService.import(pi1Dto);
      researcher1 = await userService.import(researcher1Dto);
      researcher2 = await userService.import(researcher2Dto);
      guest1 = await userService.import(guestDto);
      baseStock = await stockService.import(baseStockDto);
    });

    testName = '2488606 import stock with parents';
    it(testName, async () => {
      const kidDto: StockImportDto = {
        name: String(4401),
        internalDad: String(baseStock.name),
        internalMom: String(baseStock.name),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let kid: Stock = await stockService.import(kidDto);
      // re-fetch the kid
      kid = await stockService.mustExist(kid.id);
      expect(kid.matIdInternal).toBe(baseStock.id);
      expect(kid.patIdInternal).toBe(baseStock.id);
      await stockService.validateAndRemove(kid.id);
    });

    testName = '7741995 import stock with non-existent parents';
    it(testName, async () => {
      const kidDto: StockImportDto = {
        name: String(4402),
        internalDad: 'badName',
        internalMom: String(31415.09),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(kidDto)).rejects.toThrow();
    });

    testName = '3310190 import stock with researcher';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4403),
        description: String(Math.random()),
        researcherUsername: researcher1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.researcherId).toBe(researcher1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '9148284 import stock with user who is not a researcher';
    // this is allowed during import because the researcher associated with
    // the stock may have left town long ago.
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4404),
        description: String(Math.random()),
        researcherUsername: guest1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.researcherId).toBe(guest1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8748284 import stock with non-existing researcher user';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4405),
        description: String(Math.random()),
        researcherUsername: 'notARealUserJustAName',
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(stock1Dto)).rejects.toThrow();
    });

    testName = '5645354 import stock with pi';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4406),
        description: String(Math.random()),
        piUsername: pi1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.piId).toBe(pi1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '7530543 import stock with a non exiting user';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4407),
        description: String(Math.random()),
        piUsername: 'notARealUser',
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(stock1Dto)).rejects.toThrow();
    });

    testName = '7729983 import stock with a mutation';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4408),
        description: testName,
        alleles: [m1.name].join(';'),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockRepo.getStockWithRelations(stock1.id);
      expect(stock1.mutations.length).toBe(1);
      expect(stock1.mutations[0].name).toBe(mut1Dto.name);
      expect(stock1.mutations[0].gene).toBe(mut1Dto.gene);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '4743085 import stock with a transgene';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4409),
        description: String(Math.random()),
        alleles: [tg1.allele].join(';'),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockRepo.getStockWithRelations(stock1.id);
      expect(stock1.transgenes.length).toBe(1);
      expect(stock1.transgenes[0].allele).toBe(tg1Dto.allele);
      expect(stock1.transgenes[0].descriptor).toBe(tg1Dto.descriptor);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8293781 import stock multiple transgenes and mutations';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4410),
        description: String(Math.random()),
        alleles: [tg1.allele, m2.name, m1.name, tg2.allele].join(';'),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockRepo.getStockWithRelations(stock1.id);
      expect(stock1.transgenes.length).toBe(2);
      expect(stock1.mutations.length).toBe(2);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8651779 import stock with bogus alleles';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4411),
        description: String(Math.random()),
        alleles: 'dummy;wrong;alias;tarts',
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(stock1Dto)).rejects.toThrow();
    });

    afterAll(async () => {
      await mutationService.validateAndRemove(m1.id);
      await mutationService.validateAndRemove(m2.id);
      await transgeneService.validateAndRemove(tg1.id);
      await transgeneService.validateAndRemove(tg2.id);
      await userService.deactivate(pi1);
      await userService.delete(pi1.id);
      await userService.deactivate(researcher1);
      await userService.delete(researcher1.id);
      await userService.deactivate(researcher2);
      await userService.delete(researcher2.id);
      await userService.deactivate(guest1);
      await userService.delete(guest1.id);
      await stockService.validateAndRemove(baseStock.id);
    });

  });

  afterAll(async () => {
    await connection.close();
  });

});
