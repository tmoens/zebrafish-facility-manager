import {Brackets, EntityRepository, Repository, SelectQueryBuilder} from 'typeorm';
import {BadRequestException, Inject} from '@nestjs/common';
import {Stock} from './stock.entity';
import {StockReportDTO} from './dto/stock-report.dto';
import {StockFilter} from './stock-filter';
import {StockMiniDto} from '../common/Stock/stockMiniDto';
import {Logger} from 'winston';
import {AutoCompleteOptions} from '../helpers/autoCompleteOptions';
import moment = require('moment');


@EntityRepository(Stock)
export class StockRepository extends Repository<Stock> {
  constructor(
    @Inject('winston') private readonly logger: Logger,
  ) {
    super();
  }

  async getStockWithRelations(id: number): Promise<Stock> {
    const stock: Stock = await super.findOne(id, {
      relations: [
        'transgenes', 'mutations', 'swimmers', 'swimmers.tank',
        'matStock', 'matStock.mutations', 'matStock.transgenes',
        'patStock', 'patStock.mutations', 'patStock.transgenes',
        'piUser', 'researcherUser',
      ]
    });
    if (!stock) {
      const msg = 'Stock does not exist. Id: ' + id;
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }
    await this.computeAncillaryFields(stock);

    return stock;
  }

  async getStockMedium(id: number): Promise<Stock> {
    const stock: Stock = await super.findOne(id, {relations: [
        'transgenes', 'mutations',
        'matStock',
        'patStock',
        'piUser',
        'researcherUser'
      ]});
    if (!stock) {
      const msg = 'Stock does not exist. Id: ' + id;
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }

    return stock;
  }

  async getStockWithGenetics(id: number): Promise<Stock> {
    const stock: Stock = await super.findOne(id, {relations: [
        'transgenes', 'mutations',
      ]});
    if (!stock) {
      const msg = 'Stock does not exist. Id: ' + id;
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }
    return stock;
  }

  async computeAncillaryFields(stock: Stock) {
    // Set some ancillary computed fields
    // Kludge Alert.  Clearly this should be done in the Stock Class but that
    // class does not have access to the repository to figure this stuff out.
    // So I do it here.
    stock.offspring = await this.getOffspring(stock.id);
    stock.offspringCount = await this.countOffspring(stock.id);
    stock.nextSubStockNumber = await this.getNextSubStockNumber(stock.number);
    stock.isDeletable = this.isDeletable(stock);
    stock.parentsEditable = this.parentsEditable(stock);
    return;
  }

  // You cannot delete a stock if
  // - it is alive in a tank
  // - it has descendants
  // - it is a base stock and it has subStocks
  // Belt and suspenders.  We use this function to
  // a) send a deletable flag to the GUI so it can disable deletes appropriately
  // b) check before performing a delete request
  // Icky - it assumes two other ancillary fields have been computed.
  isDeletable(stock: Stock): boolean {
    if (stock.offspringCount > 0 ) { return false; }
    if (stock.swimmers.length > 0) {return false; }
    return !(stock.subNumber === 0 && stock.nextSubStockNumber > 1);
  }

  // You cannot edit the parents of a stock if it would lead to inconsistencies
  // in the data.  Specifically
  // - a stock with subStocks: can't change the parent of the stock or any of the
  //   subStocks because they must all have the same parents.
  // - a stock with offspring: because the offspring's mutations and transgenes came
  //   from parent in the first place, so if you change the parent's parent, the
  //   inheritance becomes wonky.
  parentsEditable(stock: Stock): boolean {
    if (stock.offspringCount > 0) {
      return false;
    }
    return stock.nextSubStockNumber <= 1;
  }

  // What is the next available number for the stock?
  async getNextStockNumber(): Promise<number> {
    const latest = await this.createQueryBuilder('m')
      .select('MAX(m.number)', 'max')
      .getRawOne();
    return Number(latest.max) + 1;
  }

  async getNextStockName(): Promise<any> {
    return {name: String(await this.getNextStockNumber())};
  }

  // What is the next available sub stock number for a given stock number?
  async getNextSubStockNumber(stockNumber): Promise<number> {
    const latest = await this.createQueryBuilder('s')
      .select('MAX(s.subNumber)', 'max')
      .where('s.number = :sn', {sn: stockNumber})
      .getRawOne();
    return Number(latest.max) + 1;
  }

  // values that can be used to auto-complete various fields in the GUI
  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    // once upon a time when stock researchers and PIs were just strings, we
    // used to fetch all the strings for researchers and PI strings
    // that were extant in the database.
    // Nowadays this researchers and pis are references to users.
    return {};
  }

  // We want to get a list of offspring including the mutation and transgene summary,
  // but not all the details of the mutations and transgenes.
  // So we join the mutations and transgenes, build the summary, and then delete the detail.
  async getOffspring(id: number): Promise<Stock[]> {
    if (id === null) return [];
    return await super.find({
        relations: ['transgenes', 'mutations'],
        where: [
          {matIdInternal: id},
          {patIdInternal: id}
        ]
      }
    );
  }

  async countOffspring(id: number): Promise<number> {
    return await this.createQueryBuilder('s')
      .where('s.matIdInternal = :id OR s.patIdInternal = :id', {id})
      .getCount();
  }

  // Find a set of stocks which match the filter criteria.
  // I know that the server should be agnostic to what a particular function
  // is used for on the client side, but this filtered list is used in the
  // stock selector. Sue me.
  // The complexity comes from the fact that the filter can be on objects associated
  // with the stock (like it's transgenes) and not simply on the stock itself.
  async findFiltered(filter: StockFilter): Promise<StockMiniDto[]> {
    // console.log('Filter: ' + JSON.stringify(filter, null, 2));

    // For this query we only look at a few fields
    let q: SelectQueryBuilder<Stock> = this.createQueryBuilder('stock')
      .leftJoin('stock.researcherUser', 'ru')
      .select('stock.id, stock.name, stock.description, stock.comment, stock.fertilizationDate')
      .addSelect('ru.name', 'researcher')
      .groupBy('stock.id');

    // We have to join a bunch of relationships based on what we are filtering for.
    // So, for example, if the filter does not include mutations, we do not need to join that table.
    if (filter.mutationId || filter.mutation) {
      q = q.leftJoin('stock.mutations', 'mutation');
    }
    if (filter.transgeneId || filter.transgene) {
      q = q.leftJoin('stock.transgenes', 'transgene');
    }
    if (filter.liveStocksOnly || filter.tankName) {
      q = q.leftJoin('stock.swimmers', 'swimmers');
    }
    if (filter.tankName) {
      q = q.leftJoin('swimmers.tank', 'tank')
    }

    q = this.buildWhereConditions(q, filter);

    const stocks: any[] = await q
      .limit(100)
      .getRawMany();

    // Please look the other way now for a minute
    const stockMinis: StockMiniDto[] = [];
    for (const s of stocks) {
      const stockWithGenetics: Stock = await this.getStockWithGenetics(s.id);
      stockMinis.push({
        id: s.id,
        name: s.name,
        description: s.description,
        researcher: s.researcher,
        comment: (s.comment) ? s.comment.substr(0, 45) : '',
        fertilizationDate: s.fertilizationDate,
        alleleSummary: stockWithGenetics.alleleSummary,
      });
    }
    return stockMinis;
  }


  // Find a set of stocks which match the filter criteria, for use in the "Tank Walker"
  // I know that the server should be agnostic to what a particular function
  // is used for on the client side, but this filtered list is used in the
  // Tank Walker. Sue me.
  async getStocksForTankWalk(filter: StockFilter): Promise<any[]> {
    // We are only interested in stocks that are in tanks.
    filter.liveStocksOnly = true;

    // For this query we only look at a few fields
    // Sort the result in tank order to facilitate someone being able to walk
    // around the facility on the trail of a particular set of stocks.
    let q: SelectQueryBuilder<Stock> = this.createQueryBuilder('stock')
      .select('stock.id as stockId, stock.name as stockName, ' +
        'tank.id as tankId, tank.name as tankName, swimmers.num, swimmers.comment')
      .orderBy('tank.id')
      .addOrderBy('stock.id')
      .groupBy('stock.id');

    // we always join stocks to their swimmers and swimmers to their tanks because
    // the tank walker only makes sense for stocks that are in tanks.
    q = q.leftJoin('stock.swimmers', 'swimmers')
      .leftJoin('swimmers.tank', 'tank')

    // join mutation or transgenes of relationships based if filtering on those
    if (filter.mutationId || filter.mutation) {
      q = q.leftJoin('stock.mutations', 'mutation');
    }
    if (filter.transgeneId || filter.transgene) {
      q = q.leftJoin('stock.transgenes', 'transgene');
    }

    // building the where conditions for the filter is exactly the same as elsewhere
    q = this.buildWhereConditions(q, filter);

    return await q.getRawMany();
  }

  // Get information about stocks so that the client can build
  // a comprehensive spreadsheet of the stocks that meet the filter criteria.
  async getStocksForReport(filter: StockFilter): Promise<StockReportDTO[]> {
    if (!filter) {
      filter = {};
    }

    // regardless of the filter criteria, we need to join all related objects to
    // every stock in order to get all the information required for the report.
    let q: SelectQueryBuilder<Stock> = this.createQueryBuilder('stock')
      .leftJoin('stock.matStock', 'mom')
      .leftJoin('stock.patStock', 'dad')
      .leftJoin('stock.mutations', 'mutation')
      .leftJoin('stock.transgenes', 'transgene')
      .leftJoin('stock.swimmers', 'swimmers')
      .leftJoin('swimmers.tank', 'tank')
      .leftJoin('stock.researcherUser', 'researcher')
      .leftJoin('stock.piUser', 'pi')
      .select('stock.name', 'Stock')
      .addSelect('stock.description', 'Description')
      .addSelect('researcher.name', 'Researcher')
      .addSelect('pi.name', 'PI')
      .addSelect('DATE_FORMAT(stock.fertilizationDate, "%Y-%m-%d")', 'DOB')
      .addSelect('mom.name', 'Mother')
      .addSelect('dad.name', 'Father')
      .addSelect('GROUP_CONCAT(DISTINCT mutation.name SEPARATOR "; ") Mutations')
      .addSelect('GROUP_CONCAT(DISTINCT transgene.descriptor SEPARATOR "; ") Transgenes')
      .addSelect('GROUP_CONCAT(DISTINCT tank.name SEPARATOR "; ") Tanks')
      .where('1')
      .groupBy('stock.id');

    // building the where conditions for the filter is exactly the same as elsewhere
    q = this.buildWhereConditions(q, filter);
    const items = await q
      .getRawMany();

    return items.map(item => {
      return new StockReportDTO(item);
    });
  }

  // Build "where" conditions of a query based on the data in a stock filter object.
  // BEWARE this function assumes that the stock has been joined to all the necessary
  // relationships to be able to apply where conditions on those relationships.
  // It also assumes no aliasing on the relationships.
  // It really just avoids duplicated code. But the fact that the SelectQueryBuilder talks about
  // object fields inside quotes makes it so that this function and the calling
  // function need to agree on the names of the fields in the quoted strings.
  buildWhereConditions(q: SelectQueryBuilder<any>, filter: StockFilter): SelectQueryBuilder<any> {
    q = q.where('1');

    // filter on a specific researcher
    if (filter.researcherId) {
      q = q.andWhere('stock.researcherId = :id', {id: filter.researcherId});
    }

    // filter on a specific pi
    if (filter.piId) {
      q = q.andWhere('stock.piId = :id', {id: filter.piId});
    }

    // a filter on the stock number matches the start of the number
    if (filter.number) {
      q = q.andWhere('stock.name LIKE :n', {n: filter.number + "%"});
    }

    // a filter on text looks anywhere in the stocks comment or description only.
    if (filter.text) {
      const text = '%' + filter.text + '%';
      q = q.andWhere(new Brackets(qb => {
        qb.where('stock.comment LIKE :t OR stock.description LIKE :t',
          {t: text});
      }));
    }

    // a filter on age is a number in days plus an "or older" or "or younger clarification"
    if (filter.age) {
      const dob = moment().subtract(Number(filter.age), 'days');
      if (filter.ageModifier === 'or_older') {
        q = q.andWhere('stock.fertilizationDate <= :d', {d: dob.format('YYYY-MM-DD')});
      } else {
        q = q.andWhere('stock.fertilizationDate >= :d', {d: dob.format('YYYY-MM-DD')});
      }
    }

    // if the filter is for a particular mutationId, you do not need to filter for names.
    // a filter for "mutation" looks in the name and gene and nickname and alternateGeneName fields
    if (filter.mutationId) {
      q = q.andWhere('mutation.id = ' + filter.mutationId);
    } else if (filter.mutation) {
      q = q.andWhere(new Brackets(qb => {
        qb.where('mutation.name LIKE :mt OR mutation.gene LIKE :mt ' +
          'OR mutation.nickname LIKE :mt OR mutation.alternateGeneName LIKE :mt',
          {mt: '%' + filter.mutation + '%'});
      }));
    }

    if (filter.transgeneId) {
      q = q.andWhere('transgene.id = ' + filter.transgeneId);
    } else if (filter.transgene) {
      q = q.andWhere(new Brackets(qb => {
        qb.where('transgene.descriptor LIKE :tg OR transgene.allele LIKE :tg OR transgene.nickname LIKE :tg',
          {tg: "%" + filter.transgene + "%"});
      }));
    }

    // if the filter includes a tank name, we do not need to filter for "liveStocksOnly"
    // because if they are in a tank, they are alive.
    if (filter.tankName) {
      q = q.andWhere('tank.name LIKE :tn', {tn: filter.tankName + '%'});
    } else if (filter.liveStocksOnly) {
      q = q.andWhere('swimmers.tankId IS NOT NULL');
    }
    return q;
  }
}


