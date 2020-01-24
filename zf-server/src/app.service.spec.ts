import { Test } from '@nestjs/testing';
import { getCustomRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock/stock.service';
import { StockRepository } from './stock/stock.repository';
import { ConfigService } from './config/config.service';
import { Connection } from 'typeorm';
import { ConfigModule } from './config/config.module';
import { Stock } from './stock/stock.entity';
import { Mutation } from './mutation/mutation.entity';
import { MutationRepository } from './mutation/mutation.repository';
import { Transgene } from './transgene/transgene.entity';
import { TransgeneRepository } from './transgene/transgene.repository';
import { MutationService } from './mutation/mutation.service';
import { TransgeneService } from './transgene/transgene.service';
import { classToClass, classToPlain } from 'class-transformer';

/**
 * This is testing that involves the relationships between the various objects
 * in system, so it involves all the services.
 */

describe('App Level testing', () => {
  let stockService: StockService;
  let stockRepo: StockRepository;
  let mutationService: MutationService;
  let mutationRepo: MutationRepository;
  let transgeneService: TransgeneService;
  let transgeneRepo: TransgeneRepository;
  let configService: ConfigService;
  let connection: Connection;
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
      ],
      providers: [
        StockRepository,
        {
          provide: getCustomRepositoryToken(Stock),
          useExisting: StockRepository,
        }],
    }).compile();
    configService = new ConfigService();
    connection = module.get(Connection);
    stockRepo = module.get<StockRepository>(StockRepository);
    mutationRepo = module.get<MutationRepository>(MutationRepository);
    transgeneRepo = module.get<TransgeneRepository>(TransgeneRepository);
    stockService = new StockService(configService, stockRepo);
    mutationService = new MutationService(configService, mutationRepo, transgeneRepo);
    transgeneService = new TransgeneService(configService, transgeneRepo, mutationRepo);
  });

  describe('6790799 Stock with relations', () => {
    const mutationData: any[] = [
      {
        name: 'n1',
        gene: 'g1',
      },
      {
        name: 'n2',
        gene: 'g1',
      },
      {
        name: 'n3',
        gene: 'g2',
      },
    ];
    const transgeneData: any[] = [
      {
        allele: 'a1',
        descriptor: 'd1',
      },
      {
        allele: 'a2',
        descriptor: 'd1',
      },
      {
        allele: 'a3',
        descriptor: 'd2',
      },
    ];
    const stockData: any[] = [
      {
        description: 'parent 1',
        comment: 'two mutations',
      },
      {
        description: 'parent 2',
        comment: 'two transgenes',
      },
      {
        description: 'parent 3',
        comment: 'mutation and tg distinct from parents 1 and 2',
      },
      {
        description: 'parent 4',
        comment: 'mutations and tgs overlapping with 1 and 2',
      },
    ];
    const stocks: Stock[] = [];

    const transgenes: Transgene[] = [];
    const mutations: Mutation[] = [];

    beforeAll( async () => {
      for (const d of mutationData) {
        mutations.push(await mutationService.validateAndCreate(d));
      }
      for (const d of transgeneData) {
        transgenes.push(await transgeneService.validateAndCreate(d));
      }
      for (const d of stockData) {
        stocks.push(await stockService.validateAndCreate(d));
      }
    });

    it('6790799 create stock with mut & tg, should ignore both', async () => {
      const s = {
        description: String(Math.random()),
        comment: '9475266 create (and get and delete) minimal stock',
        transgenes,
        mutations,
      };
      const stock: Stock = await stockService.validateAndCreate(s);
      // retrieve it again
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(stock.id);
      expect(retrievedStock.description).toBe(s.description);
      expect(retrievedStock.transgenes.length).toBe(0);
      expect(retrievedStock.mutations.length).toBe(0);
      await stockService.validateAndRemove(retrievedStock.id);
    });

    it('6371094 add mutations to stocks', async () => {
      const stockIndex = 0 ;
      stocks[stockIndex].mutations = [mutations[0], mutations[1]];
      await stockService.validateAndUpdate(stocks[stockIndex]);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(stocks[stockIndex].id);
      expect(retrievedStock.description).toBe(stockData[stockIndex].description);
      expect(retrievedStock.transgenes.length).toBe(0);
      expect(retrievedStock.mutations.length).toBe(2);
      stocks[stockIndex] = retrievedStock;
    });

    it('6371094 add transgenes to stocks', async () => {
      const stockIndex = 1 ;
      stocks[stockIndex].transgenes = [transgenes[0], transgenes[1]];
      await stockService.validateAndUpdate(stocks[stockIndex]);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(stocks[stockIndex].id);
      expect(retrievedStock.description).toBe(stockData[stockIndex].description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(0);
      stocks[stockIndex] = retrievedStock;
    });

    it('6371094 add single mutation & transgene to stocks', async () => {
      const stockIndex = 2 ;
      stocks[stockIndex].transgenes = [transgenes[2]];
      stocks[stockIndex].mutations = [mutations[2]];
      await stockService.validateAndUpdate(stocks[stockIndex]);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(stocks[stockIndex].id);
      expect(retrievedStock.description).toBe(stockData[stockIndex].description);
      expect(retrievedStock.transgenes.length).toBe(1);
      expect(retrievedStock.mutations.length).toBe(1);
      stocks[stockIndex] = retrievedStock;
    });

    it('6371094 add multiple mutations & transgenes to stocks', async () => {
      const stockIndex = 3 ;
      stocks[stockIndex].transgenes = [transgenes[2], transgenes[0]];
      stocks[stockIndex].mutations = [mutations[2], mutations[0]];
      await stockService.validateAndUpdate(stocks[stockIndex]);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(stocks[stockIndex].id);
      expect(retrievedStock.description).toBe(stockData[stockIndex].description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      stocks[stockIndex] = retrievedStock;
    });

    // Note, do not run this one on it's own, because it relies on the previos tests to have been run.
    it('9252433 you cannot delete a mutation or transgene if it is assigned to a stock', async () => {
      await expect(mutationService.validateAndRemove(mutations[0].id)).rejects.toThrow();
      await expect(transgeneService.validateAndRemove(transgenes[0].id)).rejects.toThrow();
    });

    it('8499061 create a sub-stock should bring mutations and transgenes along', async () => {
      const newSubStock: any = classToPlain(stocks[3]);
      newSubStock.description = 'substock created from whatever';
      const subStock = await stockService.validateAndCreate(newSubStock, true);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(subStock.id);
      expect(retrievedStock.description).toBe(newSubStock.description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(subStock.id);
    });

    it('7508514 create a stock with a mom, should get moms tgs and mutations', async () => {
      const stockIndex = 3 ;
      const stockD = {
        description: '7508514 test inheritance of maternal tg and muts',
        matIdInternal: stocks[stockIndex].id,
      }
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(s.id);
    });

    it('4557052 create a stock with a dad, should get dads tgs and mutations', async () => {
      const stockIndex = 3 ;
      const stockD = {
        description: '4557052 test inheritance of paternal tg and muts',
        patIdInternal: stocks[stockIndex].id,
      }
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(s.id);
    });

    it('2306243 test inheritance of non overlapping genetic markers from parents', async () => {
      const mom = stocks[0];
      const dad = stocks[1];
      const stockD = {
        description: '2306243 test inheritance of tg and muts from both parents',
        matIdInternal: mom.id,
        patIdInternal: dad.id,
      }
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(s.id);
    });

    it('2421246 test inheritance of non overlapping genetic markers from parents', async () => {
      const mom = stocks[0];
      const dad = stocks[2];
      const stockD = {
        description: '2421246 test inheritance of tg and muts from both parents',
        matIdInternal: mom.id,
        patIdInternal: dad.id,
      }
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(1);
      expect(retrievedStock.mutations.length).toBe(3);
      await stockService.validateAndRemove(s.id);
    });

    it('2125902 test inheritance of overlapping genetic markers from parents', async () => {
      const mom = stocks[0];
      const dad = stocks[0];
      const stockD = {
        description: '2125902 test inheritance of tg and muts from both parents',
        matIdInternal: mom.id,
        patIdInternal: dad.id,
      };
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(0);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(s.id);
    });

    it('3655425 test inheritance of overlapping genetic markers from parents', async () => {
      const mom = stocks[2];
      const dad = stocks[3];
      const stockD = {
        description: '3655425 test inheritance of tg and muts from both parents',
        matIdInternal: mom.id,
        patIdInternal: dad.id,
      };
      const s = await stockService.validateAndCreate(stockD);
      const retrievedStock: Stock = await stockRepo.getStockWithRelations(s.id);
      expect(retrievedStock.description).toBe(stockD.description);
      expect(retrievedStock.transgenes.length).toBe(2);
      expect(retrievedStock.mutations.length).toBe(2);
      await stockService.validateAndRemove(s.id);
    });

    afterAll( async () => {
      for (const d of stocks) {
        await stockService.validateAndRemove(d.id);
      }
      for (const d of mutations) {
        await mutationService.validateAndRemove(d.id);
      }
      for (const d of transgenes) {
        await transgeneService.validateAndRemove(d.id);
      }
    });

  });

  afterAll(async () => {
    await connection.close();
  });

});
