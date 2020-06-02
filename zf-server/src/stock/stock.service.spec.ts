import {Test} from '@nestjs/testing';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../config/config.module';
import {ConfigService} from '../config/config.service';
import {Connection} from 'typeorm';
import {TransgeneRepository} from '../transgene/transgene.repository';
import {Transgene} from '../transgene/transgene.entity';
import {Stock} from './stock.entity';
import {StockRepository} from './stock.repository';
import {StockService} from './stock.service';
import {MutationRepository} from '../mutation/mutation.repository';
import {Mutation} from '../mutation/mutation.entity';
import {classToPlain} from 'class-transformer';
import {StockFilter} from './stock-filter';
import * as moment from 'moment';
import * as winston from "winston";
import {Logger} from "winston";
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from "nest-winston";
import {utilities as nestWinstonModuleUtilities} from "nest-winston/dist/winston.utilities";
import {AutoCompleteOptions} from "../helpers/autoCompleteOptions";

describe('Stock Service testing', () => {
  let logger: Logger;
  let stockService: StockService;
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
        TypeOrmModule.forFeature([Stock, StockRepository, Mutation, MutationRepository, Transgene, TransgeneRepository]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
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
    connection = module.get(Connection);
    stockRepo = module.get<StockRepository>(StockRepository);
    stockService = new StockService(logger, configService, stockRepo);
  });

  describe('3019202 CRUD Stock', () => {
    describe('3019202 Create for Stock', () => {

      it('5735594 create (and get and delete) minimal stock', async () => {
        const s = {
          description: String(Math.random()),
          comment: '5735594 create (and get and delete) minimal stock',
        };
        const stock: Stock = await stockService.validateAndCreate(s);
        // retrieve it again
        const retrievedStock: Stock = await stockRepo.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      it('4113332 id ignored when creating stock', async () => {
        const s = {
          id: 4113332,
          description: '4113332 id ignored when creating stock',
        };
        const stock: Stock = await stockService.validateAndCreate(s);
        expect(stock.id).not.toBe(4113332);
        await stockService.validateAndRemove(stock.id);
      });

      it('7675427 create (and get and delete) minimal sub stock', async () => {
        const nextStockNumber: number = await stockRepo.getNextStockNumber();
        const s = {
          description: String(Math.random()),
          comment: '7675427 create (and get and delete) minimal sub stock',
        };
        const stock: Stock = await stockService.validateAndCreate(s);
        expect(stock.number).toBe(nextStockNumber);
        const ss = {
          description: String(Math.random()),
          comment: '7675427 create (and get and delete) minimal sub stock',
          number: stock.number,
        };
        const subStock: Stock = await stockService.validateAndCreate(ss, true);
        expect(subStock.number).toBe(nextStockNumber);
        expect(subStock.subNumber).toBe(1);
        await stockService.validateAndRemove(subStock.id);
        await stockService.validateAndRemove(stock.id);
      });

      it('5285489 cannot create substock of non existent stock', async () => {
        const ss = {
          description: String(Math.random()),
          comment: '5285489 cannot create substock of non existent stock',
          number: 5285489,
        };
        await expect(stockService.validateAndCreate(ss, true)).rejects.toThrow();
      });

      it('4082281 create (and get and delete) all atomic fields', async () => {
        const s = {
          description: String(Math.random()),
          pi: String(Math.random()),
          researcher: String(Math.random()),
          externalMatId: String(Math.random()).substr(0, 10),
          externalMatDescription: String(Math.random()),
          externalPatId: String(Math.random()).substr(0, 10),
          externalPatDescription: String(Math.random()),
          comment: '4082281 create (and get and delete) full stock',
          fertilizationDate: '2020-07-31',
        };
        const stock: Stock = await stockService.validateAndCreate(s);
        // retrieve it again
        const retrievedStock: Stock = await stockRepo.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        expect(retrievedStock.pi).toBe(s.pi);
        expect(retrievedStock.researcher).toBe(s.researcher);
        expect(retrievedStock.externalMatId).toBe(s.externalMatId);
        expect(retrievedStock.externalMatDescription).toBe(s.externalMatDescription);
        expect(retrievedStock.externalPatId).toBe(s.externalPatId);
        expect(retrievedStock.externalPatDescription).toBe(s.externalPatDescription);
        expect(retrievedStock.comment).toBe(s.comment);
        expect(retrievedStock.fertilizationDate).toBe(s.fertilizationDate);
        await stockService.validateAndRemove(retrievedStock.id);
      });
    });

    describe('8019992 create for stock with parent', () => {

      it('5345700 create (and get and delete) with parent', async () => {
        const m = {
          description: 'mom' + String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
        };
        const d = {
          description: 'dad' + String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
        };
        const mom: Stock = await stockService.validateAndCreate(m);
        const dad: Stock = await stockService.validateAndCreate(d);
        const b = {
          description: String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
          matIdInternal: mom.id,
          patIdInternal: dad.id,
        };
        const baby: Stock = await stockService.validateAndCreate(b);
        // retrieve it again
        const retrievedStock: Stock = await stockRepo.getStockWithRelations(baby.id);
        expect(retrievedStock.description).toBe(b.description);
        expect(retrievedStock.matStock.description).toBe(m.description);
        expect(retrievedStock.patStock.description).toBe(d.description);
        await stockService.validateAndRemove(baby.id);
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });

      it('9087332 create with bad momId', async () => {
        const b = {
          description: String(Math.random()),
          comment: '9087332 bad momId',
          matIdInternal: 778763421,
        };
        await expect(stockService.validateAndCreate(b)).rejects.toThrow();
      });

      it('2929154 create with bad dadId', async () => {
        const b = {
          description: String(Math.random()),
          comment: '2929154 bad dadId',
          patIdInternal: 99895565,
        };
        await expect(stockService.validateAndCreate(b)).rejects.toThrow();
      });

      it('2986501 cant have baby born before mom', async () => {
        const m = {
          description: 'mom' + String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
          fertilizationDate: '2019-01-01',
        };
        const d = {
          description: 'dad' + String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
          fertilizationDate: '2019-02-01',
        };
        const mom: Stock = await stockService.validateAndCreate(m);
        const dad: Stock = await stockService.validateAndCreate(d);
        const b = {
          description: String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
          fertilizationDate: '2019-01-12',
          matIdInternal: mom.id,
          patIdInternal: dad.id,
        };
        await expect(stockService.validateAndCreate(b)).rejects.toThrow();
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });
    });

    // Normal cases for deletion are handled as a cleanup for creation tests.
    // These are the abnormal cases for deletion.
    describe('3414047 (Abnormal) Delete for Stock', () => {

      it('3531303 cannot delete a base stock before its substock', async () => {
        const s = {
          description: String(Math.random()),
          comment: '3531303 base stock',
        };
        const stock: Stock = await stockService.validateAndCreate(s);
        const ss = {
          description: String(Math.random()),
          comment: 'sub stock',
          number: stock.number,
        };
        const subStock: Stock = await stockService.validateAndCreate(ss, true);
        // try to delete the substock first should throw an exception
        await expect(stockService.validateAndRemove(stock.id)).rejects.toThrow();
        await stockService.validateAndRemove(subStock.id);
        await stockService.validateAndRemove(stock.id);
      });

      it('7540629 cannot delete a stock with children', async () => {
        const p = {
          description: String(Math.random()),
          comment: '7540629 parent',
        };
        const parent: Stock = await stockService.validateAndCreate(p);
        const c = {
          description: String(Math.random()),
          comment: '7540629 child',
          patIdInternal: parent.id,
        };
        const child: Stock = await stockService.validateAndCreate(c);
        // try to delete the parent first should throw an exception
        await expect(stockService.validateAndRemove(parent.id)).rejects.toThrow();
        await stockService.validateAndRemove(child.id);
        await stockService.validateAndRemove(parent.id);
      });
    });

    describe('5465529 Update for stocks',  () => {

      it('5730633 update all atomic fields', async () => {
        const i = {
          comment: '5730633 before',
        };
        const initialStock = await stockService.validateAndCreate(i);
        const s = {
          id: initialStock.id,
          description: String(Math.random()),
          pi: String(Math.random()),
          researcher: String(Math.random()),
          externalMatId: String(Math.random()).substr(0, 10),
          externalMatDescription: String(Math.random()),
          externalPatId: String(Math.random()).substr(0, 10),
          externalPatDescription: String(Math.random()),
          comment: '5730633 after',
          fertilizationDate: '2020-07-31',
        };
        const updatedStock: Stock = await stockService.validateAndUpdate(s);
        expect(updatedStock.description).toBe(s.description);
        expect(updatedStock.pi).toBe(s.pi);
        expect(updatedStock.researcher).toBe(s.researcher);
        expect(updatedStock.externalMatId).toBe(s.externalMatId);
        expect(updatedStock.externalMatDescription).toBe(s.externalMatDescription);
        expect(updatedStock.externalPatId).toBe(s.externalPatId);
        expect(updatedStock.externalPatDescription).toBe(s.externalPatDescription);
        expect(updatedStock.comment).toBe(s.comment);
        expect(updatedStock.fertilizationDate).toBe(s.fertilizationDate);
        await stockService.validateAndRemove(updatedStock.id);
      });

      it('9747996 cannot update stock with no id', async () => {
        const i = {
          comment: '5730633 before',
        };
        const initialStock = await stockService.validateAndCreate(i);
        const s = {
          comment: '5730633 after',
        };
        await expect(stockService.validateAndUpdate(s)).rejects.toThrow();
        await stockService.validateAndRemove(initialStock.id);
      });

      it('9115426 cannot change name or number', async () => {
        const i = {
          comment: '9115426 before',
        };
        const initialStock = await stockService.validateAndCreate(i);
        const s = {
          id: initialStock.id,
          name: 'noWay',
          number: 'notHappening',
          subNumber: 'IDontThinkSo',
          comment: '9115426 after',
        };
        const updatedStock: Stock = await stockService.validateAndUpdate(s);
        expect(updatedStock.name).toBe(initialStock.name);
        expect(updatedStock.number).toBe(initialStock.number);
        expect(updatedStock.subNumber).toBe(initialStock.subNumber);
        expect(updatedStock.comment).toBe(s.comment);
        await stockService.validateAndRemove(initialStock.id);
      });
    });

    describe('4469887 update for stock with parent', () => {

      it('1830971 update with parent', async () => {
        const m = {
          description: 'mom' + String(Math.random()),
          comment: '1830971 mom',
        };
        const mom: Stock = await stockService.validateAndCreate(m);
        const d = {
          description: 'dad' + String(Math.random()),
          comment: '1830971 dad',
        };
        const dad: Stock = await stockService.validateAndCreate(d);
        const b = {
          description: String(Math.random()),
          comment: '5345700 create (and get and delete) with parent',
          matIdInternal: mom.id,
          patIdInternal: dad.id,
        };
        const baby: Stock = await stockService.validateAndCreate(b);
        // retrieve it again
        const nm = {
          description: 'new mom' + String(Math.random()),
          comment: '1830971 new mom',
        };
        const newMom: Stock = await stockService.validateAndCreate(nm);
        baby.matIdInternal = newMom.id;
        const babyDTO = classToPlain(baby);
        const updatedBaby: Stock = await stockService.validateAndUpdate(babyDTO);
        expect(updatedBaby.description).toBe(b.description);
        expect(updatedBaby.matStock.comment).toBe(nm.comment);
        expect(updatedBaby.patStock.comment).toBe(d.comment);
        await stockService.validateAndRemove(updatedBaby.id);
        await stockService.validateAndRemove(newMom.id);
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });

      it('8727694 update with bad momId', async () => {
        const i = {
          comment: '8727694 before',
        };
        const initialStock = await stockService.validateAndCreate(i);
        const u = {
          id: initialStock.id,
          comment: '8727694 after',
          matIdInternal: 8727694,
        };
        await expect(stockService.validateAndUpdate(u)).rejects.toThrow();
        await stockService.validateAndRemove(initialStock.id);
      });

      it('5206868 cant update stock to younger than dad', async () => {
        const m = {
          description: 'mom ' + String(Math.random()),
          comment: '5345700',
          fertilizationDate: '2019-01-01',
        };
        const d = {
          description: 'dad ' + String(Math.random()),
          comment: '5345700',
          fertilizationDate: '2019-02-01',
        };
        const mom: Stock = await stockService.validateAndCreate(m);
        const dad: Stock = await stockService.validateAndCreate(d);
        const b = {
          description: 'baby ' + String(Math.random()),
          comment: '5345700',
          matIdInternal: mom.id,
          patIdInternal: dad.id,
        };
        const baby: Stock = await stockService.validateAndCreate(b);
        baby.fertilizationDate = '2019-01-19';
        const babyDTO = classToPlain(baby);
        await expect(stockService.validateAndUpdate(babyDTO)).rejects.toThrow();
        await stockService.validateAndRemove(baby.id);
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });

      it('8837324 cant update stock to older than kids', async () => {
        const m = {
          description: 'mom' + String(Math.random()),
          comment: '8837324',
          fertilizationDate: '2019-01-01',
        };
        let mom: Stock = await stockService.validateAndCreate(m);
        const d = {
          description: 'dad' + String(Math.random()),
          comment: '8837324',
          fertilizationDate: '2019-02-01',
        };
        const dad: Stock = await stockService.validateAndCreate(d);
        const b = {
          description: String(Math.random()),
          comment: '8837324',
          matIdInternal: mom.id,
          patIdInternal: dad.id,
          fertilizationDate: '2019-03-01',
        };
        const baby: Stock = await stockService.validateAndCreate(b);
        // re-fetch mom now that she has kids
        mom = await stockRepo.getStockWithRelations(mom.id);
        mom.fertilizationDate = '2019-03-19';
        const momDTO = classToPlain(mom);
        await expect(stockService.validateAndUpdate(momDTO)).rejects.toThrow();
        await stockService.validateAndRemove(baby.id);
        await stockService.validateAndRemove(mom.id);
        await stockService.validateAndRemove(dad.id);
      });
    });

  });

  describe('8188099 Stock filtering and reporting', () => {
    /*
     * We are assuming that the database is empty for this test.  If not,
     * at least the first test will fail.
     *
     * For the most part, we just test that the number of returned items is
     * correct, we do not check the structure of the returned lists.
     */
    // Be careful if you change any of these as it will probably throw off the filter tests
    const TEN_DAYS_AGO = moment().subtract(10, 'days').format('YYYY-MM-DD');
    const ELEVEN_DAYS_AGO = moment().subtract(11, 'days').format('YYYY-MM-DD');
    const stocksForFilterTests: any[] = [
      {
        description: '8188099 stock11 x',
        researcher: 'Fred Flintstone',
        fertilizationDate: TEN_DAYS_AGO,
        comment: 'abcdefg',
      },
      {
        description: '8188099 stock21 x',
        researcher: 'Wilma Flintstone',
        fertilizationDate: ELEVEN_DAYS_AGO,
        comment: 'cdefghi',
      },
      {
        description: '8188099 stock22 y',
        researcher: 'Fred Flintstone',
        fertilizationDate: ELEVEN_DAYS_AGO,
        comment: 'defghkl',
      },
      {
        description: '8188099 stock23 xy',
        researcher: 'Barney Rubble',
        fertilizationDate: TEN_DAYS_AGO,
        comment: 'abqp',
      },
      {
        description: '8188099 stock2 x',
        researcher: 'BamBam',
        fertilizationDate: ELEVEN_DAYS_AGO,
        comment: 'y',
      },
    ];
    const stocks: Stock[] = [];

    // put some stocks in the database
    beforeAll(async () => {
      for (const s of stocksForFilterTests) { stocks.push(await stockService.validateAndCreate(s)); }
    });

    it('5684573 open filter. Will fail if db not empty before test.', async () => {
      const filter: StockFilter = new StockFilter();
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(5);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(5);
    });

    it('9468788 direct match smallest number.', async () => {
      const filter: StockFilter = new StockFilter();
      filter.number = String(stocks[0].number);
      const list = await stockRepo.findFiltered(filter);
      // check the returned length
      expect(list.length).toBe(1);
      // check the returned value
      expect(list[0].description).toBe(stocksForFilterTests[0].description);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(1);
    });

    it('8258046 direct match 4th number', async () => {
      // Note: The filtered list gives all stocks that start with the specified number.
      //       On the other hand, the report gives stocks with names LIKE
      //       the specified name.
      // TMOTS is that names are a sucky way to filter.
      const filter: StockFilter = new StockFilter();
      filter.number = String(stocks[3].name);
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(1);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(1);
    });

    it('7583787 direct match unique description', async () => {
      const filter: StockFilter = new StockFilter();
      filter.text = '8188099 stock11 x';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(1);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(1);
    });

    it('4137399 matches 4 descriptions', async () => {
      const filter: StockFilter = new StockFilter();
      filter.text = 'stock2';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(4);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(4);
    });

    it('8608440 matches 2 researchers, 3 stocks (case insensitivity tested)', async () => {
      const filter: StockFilter = new StockFilter();
      filter.researcher = 'flINtstOne';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(3);
      const reportList = await stockRepo.getReport(filter);
      expect(reportList.length).toBe(3);
    });

    it('8324381 age test or older', async () => {
      const filter: StockFilter = new StockFilter();
      filter.age = 10;
      filter.ageModifier = 'or_older';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(5);
      // const reportList = await stockRepo.getReport(filter);
      // expect(reportList.length).toBe(5);
    });

    it('7672696 age test or younger', async () => {
      const filter: StockFilter = new StockFilter();
      filter.age = 9;
      filter.ageModifier = 'or_younger';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(0);
      // const reportList = await stockRepo.getReport(filter);
      // expect(reportList.length).toBe(0);
    });

    it('3677062 age test or younger', async () => {
      const filter: StockFilter = new StockFilter();
      filter.age = 10;
      filter.ageModifier = 'or_younger';
      const list = await stockRepo.findFiltered(filter);
      expect(list.length).toBe(2);
      // const reportList = await stockRepo.getReport(filter);
      // expect(reportList.length).toBe(2);
    });

    afterAll(async () => {
      for (const s of stocks) { await stockService.validateAndRemove(s.id); }
    });
  });

  describe('876126 Miscellaneous Stock testing', () => {

    it('6844284 Autocomplete options', async () => {
      // The options is the list of unique researchers in the database.
      // Test Strategy:
      // Check what the options are to start.
      const initialOptions: AutoCompleteOptions = await stockRepo.getAutoCompleteOptions();

      // Add a stock with an almost certainly new researcher and save it.
      const randomResearcher1: string = String(Math.random());
      const s1 = {
        description: '6844284 for stock autocomplete options',
        researcher: randomResearcher1,
      };
      const stock1: Stock = await stockService.validateAndCreate(s1);
      let options: AutoCompleteOptions = await stockRepo.getAutoCompleteOptions();
      // There should be one more option than we started and we know what it should be.
      expect(initialOptions.researcher.length === options.researcher.length + 1 &&
        options.researcher.includes(randomResearcher1));

      // Add another stocks with the same new researcher.
      const s2 = {
        description: '6844284 for stock autocomplete options',
        researcher: randomResearcher1,
      };
      const stock2: Stock = await stockService.validateAndCreate(s2);
      options = await stockRepo.getAutoCompleteOptions();
      // There should still only be one more option than we started with.
      expect(initialOptions.researcher.length === options.researcher.length + 1 &&
        options.researcher.includes(randomResearcher1));

      // Delete the first stock we added - things should stay the same.
      await stockRepo.delete(stock1.id);
      options = await stockRepo.getAutoCompleteOptions();
      // There should still only be one more option than we started with.
      expect(initialOptions.researcher.length === options.researcher.length + 1 &&
        options.researcher.includes(randomResearcher1));

      // Delete the other we added and everything should be back to the the initial state.
      await stockRepo.delete(stock2.id);
      options = await stockRepo.getAutoCompleteOptions();
      expect(initialOptions.researcher.length === options.researcher.length &&
        !options.researcher.includes(randomResearcher1));
    });

    it('6581267 find a stock by name.', async () => {
      const s = {
        description: '6581267 find a stock by name.',
      };
      const stock1 = await stockService.validateAndCreate(s);
      const lookupStock1 = await stockRepo.findByName(stock1.name);
      expect(lookupStock1.id === 2388769);
      await stockService.validateAndRemove(stock1.id);
    });
  });

  afterAll(async () => {
    await connection.close();
  });

});
