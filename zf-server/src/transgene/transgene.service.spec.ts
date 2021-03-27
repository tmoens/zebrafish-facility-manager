import {Test} from '@nestjs/testing';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../config/config.module';
import {ConfigService} from '../config/config.service';
import {Connection} from 'typeorm';
import {Transgene} from './transgene.entity';
import {TransgeneService} from './transgene.service';
import {MutationRepository} from '../mutation/mutation.repository';
import {Mutation} from '../mutation/mutation.entity';
import {TransgeneFilter} from './transgene.filter';
import {TransgeneRepository} from './transgene.repository';
import * as winston from "winston";
import {Logger} from "winston";
import {utilities as nestWinstonModuleUtilities} from "nest-winston/dist/winston.utilities";
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from "nest-winston";
import {AutoCompleteOptions} from "../helpers/autoCompleteOptions";

describe('TransgeneService testing', () => {
  let logger: Logger;
  let service: TransgeneService;
  let mutationRepo: MutationRepository;
  let transgeneRepo: TransgeneRepository;
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
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useExisting: ConfigService,
        }),
        TypeOrmModule.forFeature([
          Transgene,
          TransgeneRepository,
          Mutation,
          MutationRepository,
        ]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
        }),
      ],
      providers: [
        TransgeneRepository,
        {
          provide: getCustomRepositoryToken(Transgene),
          useExisting: TransgeneRepository,
        },
      ],
    }).compile();
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    configService = new ConfigService();
    connection = module.get(Connection);
    transgeneRepo = module.get<TransgeneRepository>(TransgeneRepository);
    mutationRepo = module.get<MutationRepository>(MutationRepository);
    service = new TransgeneService(logger, configService, transgeneRepo, mutationRepo);
  });

  describe('4974046 creation of "owned" transgenes', () => {
    it('9707387 create next "owned" transgene', async () => {
      const ownerPrefix = configService.facilityInfo.prefix;
      const nextSerialNumber = await service.getNextSerialNumber();
      const m = {
        descriptor: String(Math.random()).substr(3, 10),
        comment: '9707387 create next "owned" transgene',
      };
      const transgene: Transgene = await service.validateAndCreateOwned(m);
      expect(transgene.serialNumber).toBe(nextSerialNumber);
      expect(transgene.allele).toBe(ownerPrefix + nextSerialNumber);
      await service.validateAndRemove(transgene.id);
    });

    it('4555147 serial number and allele ignored when creating an "owned" transgene ', async () => {
      const ownerPrefix = configService.facilityInfo.prefix;
      const nextSerialNumber = await service.getNextSerialNumber();
      const m = {
        allele: 'irrelevant',
        serialNumber: 'just does not matter',
        descriptor: String(Math.random()).substr(3, 10),
        comment:
          '4555147 serial number and name ignored when creating an "owned" transgene',
      };
      const transgene: Transgene = await service.validateAndCreateOwned(m);
      expect(transgene.serialNumber).toBe(nextSerialNumber);
      expect(transgene.allele).toBe(ownerPrefix + nextSerialNumber);
      await service.validateAndRemove(transgene.id);
    });

    it('9982105 cannot name a new transgene with that could conflict with "owned" transgenes', async () => {
      const ownerPrefix = configService.facilityInfo.prefix;
      const m = {
        allele: ownerPrefix + 'anyoldthing',
        descriptor: String(Math.random()).substr(3, 10),
        comment: '9982105 bad transgene name',
      };
      await expect(service.validateAndCreate(m)).rejects.toThrow();
    });
  });

  describe('2939564 CRUD for minimal Transgene', () => {
    it('3392332 create (and get and delete) minimal transgene', async () => {
      const randomString1: string = String(Math.random());
      const m = {
        allele: randomString1,
        descriptor: String(Math.random()).substr(3, 10),
        comment: '3392332 for transgene creation test',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      // retrieve it again
      const retrievedTransgene: Transgene = await service.mustExist(
        transgene.id,
      );
      expect(retrievedTransgene.allele).toBe(randomString1);
      expect(await service.validateAndRemove(retrievedTransgene.id));
    });

    it('9248416 cannot create a transgene without an allele', async () => {
      const m = {
        descriptor: String(Math.random()).substr(3, 10),
        comment: '9248416 cannot create a transgene without an allele',
      };
      await expect(service.validateAndCreate(m)).rejects.toThrow();
    });

    it('6509856 cannot create a transgene with an existing name', async () => {
      const m = {
        allele: String(Math.random()),
        descriptor: String(Math.random()).substr(3, 10),
        comment: '6509856 cannot create a transgene with an existing name',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      await expect(service.validateAndCreate(m)).rejects.toThrow();
      await service.validateAndRemove(transgene.id);
    });

    it('6295267 id ignored when creating transgene', async () => {
      const m = {
        id: 288976,
        allele: String(Math.random()),
        descriptor: String(Math.random()).substr(3, 10),
        comment: '6295267 id ignored when creating transgene',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      expect(transgene.id).not.toBe(288976);
      await service.validateAndRemove(transgene.id);
    });

    it('1495784 serial number ignored when creating transgene', async () => {
      const m = {
        serialNumber: 4566211,
        allele: String(Math.random()),
        descriptor: String(Math.random()).substr(3, 10),
        comment: '1495784 serial number ignored when creating transgene',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      expect(transgene.serialNumber).not.toBe(4566211);
      await service.validateAndRemove(transgene.id);
    });

    it('9282344 update (and delete) minimal transgene', async () => {
      const randomString1: string = String(Math.random());
      const randomString2: string = String(Math.random());
      const m = {
        allele: randomString1,
        descriptor: String(Math.random()).substr(3, 10),
        comment: '9282344 for transgene update test (before)',
        plasmid: randomString1,
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      const u = {
        id: transgene.id,
        comment: '9282344 for transgene update test (after)',
        plasmid: randomString2,
      };
      await service.validateAndUpdate(u);
      const updatedTransgene: Transgene = await service.mustExist(transgene.id);
      expect(updatedTransgene.comment).toBe(
        '9282344 for transgene update test (after)',
      );
      expect(updatedTransgene.plasmid === randomString2);
      expect(await service.validateAndRemove(updatedTransgene.id));
    });

    it('7611611 cannot get non-existent transgene', async () => {
      await expect(service.mustExist(7611611)).rejects.toThrow();
    });

    // If this test goes at the end of the suite, it fails.
    // Spent half an hour and could not determine why.
    // It works just fine when run in the debugger or when not last.
    // So strange because the next test is virtually identical and has
    // not problem at the end of the test suite.
    it('3167733 cannot delete non-existent transgene', async () => {
      await expect(service.validateAndRemove(789356271)).rejects.toThrow();
    });

    it('3019388 cannot update non-existent transgene', async () => {
      const m = {
        id: 3019388,
        comment: '3019388 cannot update non-existent transgene',
      };
      await expect(service.validateAndUpdate(m)).rejects.toThrow();
    });
  });

  describe('3499897 Transgene filtering and reporting', () => {
    /*
     * In order not to have to assume that the database is empty at the start
     * of this test, we stick a special string in the plasmid field and
     * all filters include a filter for that special string.
     * Of course this pre-supposes that plasmid filtering works.
     *
     * For the most part, we just test that the number of returned items is
     * correct, we do not check the structure of the returned lists.
     */
    // Be careful if you change any of these as it will probably throw off the filter tests
    const rs1 = String(Math.random()).substr(3, 10);
    const rs2 = String(Math.random()).substr(3, 10);
    const rs3 = String(Math.random()).substr(3, 10);
    const rs4 = String(Math.random()).substr(3, 10);
    const rs5 = String(Math.random()).substr(3, 10);
    const transgenesForFilterTests: any[] = [
      {
        allele: 'a' + rs1,
        comment: rs2,
        descriptor: 'x' + rs3,
        source: rs4,
        plasmid: rs5,
      },
      {
        allele: 'b' + rs1,
        comment: rs3,
        descriptor: rs2,
        source: rs4 + rs3,
        plasmid: rs5 + rs3,
      },
      {
        allele: 'c' + rs1,
        comment: rs1,
        descriptor: rs1,
        source: rs2,
        plasmid: rs5 + rs3,
      },
      {
        allele: 'd' + rs1,
        comment: rs1,
        descriptor: rs3,
        source: rs1 + rs3,
        plasmid: rs2,
      },
    ];
    const transgenes: Transgene[] = [];

    beforeAll(async () => {
      // put some transgenes in the database
      for (const m of transgenesForFilterTests) {
        transgenes.push(await service.validateAndCreate(m));
      }
    });

    it('part of allele shared across all', async () => {
      const filter: TransgeneFilter = new TransgeneFilter();
      filter.text = rs1;
      const list = await service.findFiltered(filter);
      expect(list.length).toBe(4);
    });
    it('same string found in various fields', async () => {
      const filter: TransgeneFilter = new TransgeneFilter();
      filter.text = rs2;
      const list = await service.findFiltered(filter);
      expect(list.length).toBe(4);
    });
    it('same string is a substring in different fields', async () => {
      const filter: TransgeneFilter = new TransgeneFilter();
      filter.text = rs3;
      const list = await service.findFiltered(filter);
      expect(list.length).toBe(4);
    });
    it('string in two transgenes only', async () => {
      const filter: TransgeneFilter = new TransgeneFilter();
      filter.text = rs4;
      const list = await service.findFiltered(filter);
      expect(list.length).toBe(2);
    });
    it('not found', async () => {
      const filter: TransgeneFilter = new TransgeneFilter();
      filter.text = 'not in any field';
      const list = await service.findFiltered(filter);
      expect(list.length).toBe(0);
    });

    afterAll(async () => {
      for (const m of transgenes) {
        await service.validateAndRemove(m.id);
      }
    });
  });

  describe('9708658 Other misc transgene tests', () => {
    it('5404743 find by Id, find by name', async () => {
      const m = {
        allele: String(Math.random()).substr(0, 10),
        descriptor: String(Math.random()).substr(0, 10),
        comment: '5404743 find by Id, find by name',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      const foundByAllele: Transgene = await service.findByName(
        m.allele,
      );
      expect(foundByAllele.id).toBe(transgene.id);
      const foundById: Transgene = await service.findById(transgene.id);
      expect(foundById.allele).toBe(m.allele);
      await service.validateAndRemove(transgene.id);
    });

    it('9594858 minimal test of getAutoCompleteOptions', async () => {
      const initialOptions: AutoCompleteOptions = await service.getAutoCompleteOptions();
      const m = {
        allele: String(Math.random()).substr(0, 10),
        descriptor: String(Math.random()).substr(0, 10),
        source: String(Math.random()).substr(0, 10),
        comment: '9594858 minimal test of getAutoCompleteOptions',
      };
      const transgene: Transgene = await service.validateAndCreate(m);
      const newOptions: AutoCompleteOptions = await service.getAutoCompleteOptions();
      expect(newOptions.source.length).toBe(initialOptions.source.length + 1);
      await service.validateAndRemove(transgene.id);
    });
  });

  afterAll(async () => {
    await connection.close();
  });
});
