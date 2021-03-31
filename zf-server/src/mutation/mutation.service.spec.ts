import {Test} from '@nestjs/testing';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../config/config.module';
import {ConfigService} from '../config/config.service';
import {Connection} from 'typeorm';
import {MutationRepository} from './mutation.repository';
import {Mutation} from './mutation.entity';
import {MutationService} from './mutation.service';
import {TransgeneRepository} from '../transgene/transgene.repository';
import {Transgene} from '../transgene/transgene.entity';
import {MutationFilter} from './mutation.filter';
import * as winston from 'winston';
import {Logger} from 'winston';
import {utilities as nestWinstonModuleUtilities} from 'nest-winston/dist/winston.utilities';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from 'nest-winston';
import {ZfinService} from '../zfin/zfin.service';
import {ZfinModule} from '../zfin/zfin.module';

describe('MutationService testing', () => {
  let logger: Logger;
  let mutationService: MutationService;
  let mutationRepo: MutationRepository;
  let transgeneRepo: TransgeneRepository;
  let configService: ConfigService;
  let zfinService: ZfinService;
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
        ZfinModule,
        TypeOrmModule.forRootAsync(
          {
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        TypeOrmModule.forFeature([Mutation, MutationRepository, Transgene, TransgeneRepository]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
        }),
      ],
      providers: [
        MutationRepository,
        {
          provide: getCustomRepositoryToken(Mutation),
          useExisting: MutationRepository,
        }],
    }).compile();
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    configService = new ConfigService();
    zfinService = new ZfinService();
    connection = module.get(Connection);
    mutationRepo = module.get<MutationRepository>(MutationRepository);
    transgeneRepo = module.get<TransgeneRepository>(TransgeneRepository);
    mutationService = new MutationService(logger, configService, mutationRepo, transgeneRepo, zfinService);

  });

  describe('8904557 creation of "owned" mutations', () => {
    let nextSerialNumber: number;

    it('8904557 create next "owned" mutation', async () => {
      const ownerPrefix = configService.facilityInfo.prefix;
      nextSerialNumber = await mutationService.getNextSerialNumber();
      const m = {
        comment: '8904557 create next "owned" mutation',
      };
      const mutation: Mutation = await mutationService.validateAndCreateOwned(m);
      expect(mutation.serialNumber).toBe(nextSerialNumber);
      expect(mutation.name).toBe(ownerPrefix + nextSerialNumber);
      await mutationService.validateAndRemove(mutation.id);
    });

    it('6950004 serial number and name ignored when creating an "owned" mutation ', async () => {
      const ownerPrefix = configService.facilityInfo.prefix;
      nextSerialNumber = await mutationService.getNextSerialNumber();
      const m = {
        name: 'irrelevant',
        serialNumber: 'just does not matter',
        comment: '6950004 serial number and name ignored when creating an "owned" mutation',
      };
      const mutation: Mutation = await mutationService.validateAndCreateOwned(m);
      expect(mutation.serialNumber).toBe(nextSerialNumber);
      expect(mutation.name).toBe(ownerPrefix + nextSerialNumber);
      await mutationService.validateAndRemove(mutation.id);
    });

    it('1262947 cannot name a new mutation with that could conflict with "owned" mutations',
      async () => {
        const ownerPrefix = configService.facilityInfo.prefix;
        const m = {
          name: ownerPrefix + 'anyoldthing',
          comment: '1262947 bad mutation name',
        };
        await expect(mutationService.validateAndCreate(m)).rejects.toThrow();
      });
  });

  describe('5133501 CRUD for minimal Mutation', () => {

    it('5735594 create (and get and delete) minimal mutation', async () => {
      const randomString1: string = String(Math.random()).substr(0, 19);
      const m = {
        name: randomString1,
        comment: '5735594 for mutation creation test',
      };
      const mutation: Mutation = await mutationService.validateAndCreate(m);
      // retrieve it again
      const retrievedMutation: Mutation = await mutationService.mustExist(mutation.id);
      expect(retrievedMutation.name).toBe(randomString1);
      await mutationService.validateAndRemove(retrievedMutation.id);
    });

    it('1522049 cannot create a mutation without a name', async () => {
      const m = {
        comment: '1522049 cannot create a mutation without a name',
      };
      await expect(mutationService.validateAndCreate(m)).rejects.toThrow();
    });

    it('4711473 cannot create a mutation with an existing name', async () => {
      const m = {
        name: String(Math.random()),
        comment: '4711473 cannot create a mutation with an existing name',
      };
      const mutation: Mutation = await mutationService.validateAndCreate(m);
      await expect(mutationService.validateAndCreate(m)).rejects.toThrow();
      await mutationService.validateAndRemove(mutation.id);
    });

    it('6608887 id ignored when creating mutation', async () => {
      const m = {
        id: 288976,
        name: '6608887',
        comment: '6608887 id ignored when creating mutation',
      };
      const mutation: Mutation = await mutationService.validateAndCreate(m);
      expect(mutation.id).not.toBe(288976);
      await mutationService.validateAndRemove(mutation.id);
    });

    it('3050226 serial number ignored when creating mutation', async () => {
      const m = {
        serialNumber: 4566211,
        name: '3050226',
        comment: '3050226 serial number ignored when creating mutation',
      };
      const mutation: Mutation = await mutationService.validateAndCreate(m);
      expect(mutation.serialNumber).not.toBe(4566211);
      await mutationService.validateAndRemove(mutation.id);
    });

    it('3611706 update (and delete) minimal mutation', async () => {
      const randomString1: string = String(Math.random());
      const randomString2: string = String(Math.random());
      const m = {
        name: randomString1,
        comment: '3611706 for mutation update test (before)',
        researcher: randomString1,
      };
      const mutation: Mutation = await mutationService.validateAndCreate(m);
      const u = {
        id: mutation.id,
        comment: '3611706 for mutation update test (after)',
        researcher: randomString2,
      };
      await mutationService.validateAndUpdate(u);
      const updatedMutation: Mutation = await mutationService.mustExist(mutation.id);
      expect(updatedMutation.comment).toBe('3611706 for mutation update test (after)');
      expect(updatedMutation.researcher).toBe(randomString2);
      await mutationService.validateAndRemove(updatedMutation.id);
    });

    it('7611611 cannot get non-existent mutation', async () => {
      await expect(mutationService.mustExist(7611611)).rejects.toThrow();
    });

    // If this test goes at the end of the suit, it fails.
    // Spent half an hour and could not determine why.
    // It works just fine when run in the debugger or when not last.
    // So strange because the next test is virtually identical and has
    // not problem at the end of the test suite.
    it('3167733 cannot delete non-existent mutation', async () => {
      await expect(mutationService.validateAndRemove(789356271)).rejects.toThrow();
    });

    it('3019388 cannot update non-existent mutation', async () => {
      const m = {
        id: 3019388,
        comment: '3019388 cannot update non-existent mutation',
      };
      await expect(mutationService.validateAndUpdate(m)).rejects.toThrow();
    });
  });

  describe('3499897 Mutation filtering and reporting', () => {
    /*
     * In order not to have to assume that the database is empty at the start
     * of this test, we stick a special string in the researcher field and
     * all filters include a filter for that special string.
     * Of course this pre-supposes that researcher filtering works.
     *
     * For the most part, we just test that the number of returned items is
     * correct, we do not check the structure of the returned lists.
     */
    // Be careful if you change any of these as it will probably throw off the filter tests
    const randomString = String(Math.random()).substr(0, 10);
    const mutationsForFilterTests: any[] = [
      {
        name: 'm abcde',
        researcher: randomString,
        gene: 'gene a1',
        alternateGeneName: 'gene 11',
        comment: 'abc q xyz',
        phenotype: 'ae lmn',
        morphantPhenotype: 'd qrs',
        mutationType: 'mt1',
        screenType: 'st1',
        spermFreezePlan: 'sf1',
      },
      {
        name: 'm abc',
        researcher: randomString,
        gene: 'gene b1',
        alternateGeneName: 'gene 2 q',
        comment: 'ab xy',
        phenotype: 'ae lm',
        morphantPhenotype: 'd qr',
        mutationType: 'mt1',
        screenType: 'st2',
        spermFreezePlan: 'sf3',
      },
      {
        name: 'm ab',
        researcher: randomString,
        gene: 'gene a1',
        alternateGeneName: 'gene 11',
        comment: 'abc yz',
        phenotype: 'ae lmn',
        morphantPhenotype: 'd qrs',
        mutationType: 'mt3',
        screenType: 'st3',
        spermFreezePlan: 'sf3',
      },
      {
        name: 'm a',
        researcher: randomString,
        gene: 'gene a2',
        alternateGeneName: 'gene 12',
        comment: 'ac xyz',
        phenotype: 'ae lmn',
        morphantPhenotype: 'd rs',
        mutationType: 'mt3',
        screenType: 'st3',
        spermFreezePlan: 'sf3',
      },
    ];
    const mutations: Mutation[] = [];

    beforeAll(async () => {
      // put some mutations in the database
      for (const m of mutationsForFilterTests) {
        mutations.push(await mutationService.validateAndCreate(m));
      }
    });

    it('filter screen type', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.screenType = 'st1';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(1);
    });
    it('filter screen type', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.screenType = 'st3';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(2);
    });
    it('filter mutation type', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.mutationType = 'mt3';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(2);
    });
    it('filter sperm freeze', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.spermFreeze = 'sf3';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });
    it('filter sperm freeze', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.spermFreeze = 'sf3';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });
    it('filter sperm freeze/mutation/screen', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.spermFreeze = 'sf3';
      filter.mutationType = 'mt1';
      filter.screenType = 'st2';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(1);
    });
    it('filter researcher', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(4);
    });
    it('filter gene', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.gene = 'a';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });
    it('filter gene', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.gene = 'a1';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(2);
    });
    it('filter text (in comment)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.freeText = 'x';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });

    it('filter text (in alt gene name)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.freeText = '2';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(2);
    });

    it('filter text (in alt gene name)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.freeText = '11';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(2);
    });

    it('filter text (in name)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.freeText = 'ab';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });

    it('filter text (in several fields)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.freeText = 'q';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(3);
    });

    it('filter text (no match)', async () => {
      const filter: MutationFilter = new MutationFilter();
      filter.researcher = randomString;
      filter.gene = '3853223';
      const list = await mutationService.findFiltered(filter);
      expect(list.length).toBe(0);
    });

    afterAll(async () => {
      for (const m of mutations) {
        await mutationService.validateAndRemove(m.id);
      }
    });

  });

  describe('8130636 Other misc mutation tests', () => {

    it('8907136 find by Id, find by name',
      async () => {
        const m = {
          name: String(Math.random()).substr(0, 10),
          comment: '8907136 find by Id, find by name',
        };
        const mutation: Mutation = await mutationService.validateAndCreate(m);
        const foundByName: Mutation = await mutationService.findByName(m.name);
        expect(foundByName.id).toBe(mutation.id);
        const foundById: Mutation = await mutationService.findById(mutation.id);
        expect(foundById.name).toBe(m.name);
        await mutationService.validateAndRemove(mutation.id);
      });

    it('1802501 minimal test of getAutoCompleteOptions',
      async () => {
        const initialOptions: {[index: string]: string[]} = await mutationService.getAutoCompleteOptions();
        const m = {
          name: String(Math.random()).substr(0, 10),
          gene: String(Math.random()).substr(0, 10),
          researcher: String(Math.random()).substr(0, 10),
          mutationType: String(Math.random()).substr(0, 10),
          screenType: String(Math.random()).substr(0, 10),
          comment: '1802501 minimal test of getAutoCompleteOptions',
        };
        const mutation: Mutation = await mutationService.validateAndCreate(m);
        const newOptions: {[index: string]: string[]} = await mutationService.getAutoCompleteOptions();
        expect(newOptions.gene.length).toBe(initialOptions.gene.length + 1);
        expect(newOptions.researcher.length).toBe(initialOptions.researcher.length + 1);
        expect(newOptions.mutationType.length).toBe(initialOptions.mutationType.length + 1);
        expect(newOptions.screenType.length).toBe(initialOptions.screenType.length + 1);
        expect(newOptions.gene.includes(m.gene)).toBeTruthy();
        expect(newOptions.name.includes(m.gene)).toBeFalsy();
        await mutationService.validateAndRemove(mutation.id);
      });
  });

  afterAll( async () => {
    await connection.close();
  });

});
