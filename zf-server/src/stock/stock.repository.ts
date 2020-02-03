import {Brackets, EntityRepository, Repository, SelectQueryBuilder} from 'typeorm';
import {BadRequestException, Inject} from '@nestjs/common';
import {Stock} from './stock.entity';
import { StockReportDto } from './dto/stock-report.dto';
import moment = require('moment');
import { StockFilter } from './stock-filter';
import {StockMini} from './dto/stock.mini';
import {Logger} from "winston";


@EntityRepository(Stock)
export class StockRepository extends Repository<Stock> {
  constructor(
    @Inject('winston') private readonly logger: Logger
  ) {
    super();
  }

  async mustExist(stockId: number): Promise<Stock> {
    const stock: Stock = await this.findOne(stockId);
    if (stock) {
      return stock;
    } else {
      const message: string = 'Stock does not exist. id: ' + stockId;
      this.logger.error(message,);
      throw new BadRequestException('Bad Request', message);
    }
  }

  async getById(id: number): Promise<Stock> {
    return this.mustExist(id);
  }

  async getStockWithRelations(id: number): Promise<Stock> {
    const stock: Stock = await super.findOne(id, {relations: [
        'transgenes', 'mutations', 'swimmers', 'swimmers.tank',
        'matStock', 'matStock.mutations', 'matStock.transgenes',
        'patStock', 'patStock.mutations', 'patStock.transgenes',
        'background',
      ]});
    if (!stock) {
      const msg = 'Stock does not exist. Id: ' + id;
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
    await this.computeAncillaryFields(stock);

    return stock;
  }

  async getStockGenetics(id: number): Promise<Stock> {
    const stock: Stock = await super.findOne(id, {relations: [
        'transgenes', 'mutations',
      ]});
    if (!stock) {
      const msg = 'Stock does not exist. Id: ' + id;
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
    return stock;
  }

  async computeAncillaryFields(stock: Stock) {
    // Set some ancillary computed fields
    // Kludge Alert.  Clearly this should be done in the Stock Class but that
    // class does not have access to the repository to figure this stuff out.
    // So I do it here. Sue me. :)
    stock.offspring = await this.getOffspring(stock.id);
    stock.offspringCount = await this.countOffspring(stock.id);
    stock.nextSubStockNumber = await this.getNextSubStockNumber(stock.number);
    stock.isDeletable = this.isDeletable(stock);
    stock.parentsEditable = this.parentsEditable(stock);
    return ;
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
  // - a stock with subStocks can't change the parent of the stock or any of the
  //   subStocks because they must all have the same parents.
  // - a stock with offspring because the offspring's mutations and transgenes came
  //   from parent in the first place, so if you change the parent's parent, the
  //   inheritance becomes wonky.
  parentsEditable(stock: Stock): boolean {
    if (stock.offspringCount > 0) {
      return false;
    }
    return stock.nextSubStockNumber <= 1;
  }

  // Find a set of stocks which match the filter criteria.
  // In this case we return a set of miniature stock records for two reasons:
  // a) the real reason - that TypeORM does not supply a way to use DISTINCT
  //    and without it, when you end up getting multiple records of the same
  //    stock when you join, say, with hox mutations and the stock has several
  //    hox mutations.
  // b) the records are smaller and more efficient to send to the client
  async findFiltered(filter: StockFilter): Promise<StockMini[]> {
    let q: SelectQueryBuilder<Stock> = this.createQueryBuilder('stock')
      .select('DISTINCT stock.id, stock.name, stock.description, stock.researcher, stock.comment, stock.fertilizationDate')
      .where('1');
    if (filter.number) {
      q = q.andWhere('stock.number <= :n', {n: filter.number});
    }
    if (filter.researcher) {
      q = q.andWhere('stock.researcher Like :r', {r: '%' + filter.researcher + '%'});
    }
    if (filter.text) {
      const text = '%' + filter.text + '%';
      q = q.andWhere(new Brackets( qb => {
        qb.where('stock.comment Like :t OR stock.description LIKE :t',
          {t: text});
      } ));
    }
    if (filter.mutation) {
      const text = '%' + filter.mutation + '%';
      q = q.leftJoin('stock.mutations', 'mutation')
        .andWhere(new Brackets(qb => {
          qb.where('mutation.name LIKE :mt OR mutation.gene LIKE :mt OR mutation.comment LIKE :mt OR ' +
            'mutation.phenotype LIKE :mt OR mutation.morphantPhenotype LIKE :mt',
            { mt: text });
        }));
    }
    if (filter.transgene) {
      const text = '%' + filter.transgene + '%';
      q = q.leftJoin('stock.transgenes', 'transgene')
        .andWhere(new Brackets(qb => {
          qb.where('transgene.descriptor LIKE :tt OR transgene.allele LIKE :tt OR ' +
            'transgene.plasmid LIKE :tt OR transgene.comment LIKE :tt',
            {tt: text});
        }));
    }

    // TODO Probable bug here - could join swimmers twice.
    if (filter.tankName) {
      const text = filter.tankName + '%';
      q = q.leftJoin('stock.swimmers', 'swimmers')
        .leftJoin('swimmers.tank', 'tank')
        .andWhere('tank.name LIKE :tn',
          {tn: text});
    }
    if (filter.liveStocksOnly) {
      q = q.leftJoin('stock.swimmers', 'swimmers')
        .andWhere('swimmers.tank IS NOT NULL')
        .groupBy('stock.id');
    }

    if (filter.age) {
      const dob = moment().subtract(Number(filter.age), 'days');
      if (filter.ageModifier === 'or_older') {
        q = q.andWhere('fertilizationDate <= :d', {d: dob.format('YYYY-MM-DD')});
      } else {
        q = q.andWhere('fertilizationDate >= :d', {d: dob.format('YYYY-MM-DD')});
      }
    }

    return await q
      .limit(50)
      .getRawMany();
  }

  async findByName(name: string): Promise<Stock> {
    return await this.findOne({ where: {name}});
  }

  // What is the next available number for the stock?
  async getNextStockNumber(): Promise<number> {
    const latest = await this.createQueryBuilder('m')
      .select('MAX(m.number)', 'max')
      .getRawOne();
    return  Number(latest.max) + 1;
  }

  // What is the next available sub stock number for a given stock number?
  async getNextSubStockNumber(stockNumber): Promise<number> {
    const latest = await this.createQueryBuilder('s')
      .select('MAX(s.subNumber)', 'max')
      .where('s.number = :sn', {sn: stockNumber})
      .getRawOne();
    return  Number(latest.max) + 1;
  }

  async getNextStockName(): Promise<any> {
    return { name: String( await this.getNextStockNumber()) };
  }

  // values that can be used to auto-complete various fields in the GUI
  async getAutoCompleteOptions(): Promise<any> {
    const options: any = {};
    options.researcher = await this.getAutocompleteOption('researcher');
    options.pi = await this.getAutocompleteOption('pi');
    return options;
  }

  async getAutocompleteOption(field: string): Promise<string[]> {
    const list = await this.createQueryBuilder('i')
      .select(`DISTINCT i.${field}`, field)
      .where(`i.${field} IS NOT NULL`)
      .orderBy(`i.${field}`)
      .getRawMany();
    return list.map((i: any) => i[field]);
  }

  async getOffspring(id: number): Promise<Stock[]> {
    return await this.createQueryBuilder('s')
      .where('s.matIdInternal = :id OR s.patIdInternal = :id', {id})
      .getMany();
  }

  async countOffspring(id: number): Promise<number> {
    return await this.createQueryBuilder('s')
      .where('s.matIdInternal = :id OR s.patIdInternal = :id', {id})
      .getCount();
  }

  async getReport(params: any): Promise<StockReportDto[]> {
    if (!params) { params = {}; }

    let q: SelectQueryBuilder<Stock> = this.createQueryBuilder('stock')
      .leftJoin('stock.matStock', 'mom')
      .leftJoin('stock.patStock', 'dad')
      .leftJoin('stock.mutations', 'mutation')
      .leftJoin('stock.transgenes', 'transgene')
      .leftJoin('stock.swimmers', 'swimmers')
      .leftJoin('swimmers.tank', 'tank')
      .select('stock.name', 'Stock')
      .addSelect('stock.description', 'Description')
      .addSelect('stock.researcher', 'Researcher')
      .addSelect('DATE_FORMAT(stock.fertilizationDate, "%Y-%m-%d")', 'DOB')
      .addSelect('mom.name', 'Mother')
      .addSelect('dad.name', 'Father')
      .addSelect('GROUP_CONCAT(DISTINCT mutation.name SEPARATOR "; ") Mutations')
      .addSelect('GROUP_CONCAT(DISTINCT transgene.descriptor SEPARATOR "; ") Transgenes')
      .addSelect('GROUP_CONCAT(DISTINCT tank.name SEPARATOR "; ") Tanks')
      .where( '1')
      .groupBy('stock.id');

    if (params.number) {
      q = q.andWhere('stock.name Like :n', {n: params.number + '%'});
    }
    if (params.researcher) {
      q = q.andWhere('stock.researcher Like :r', {r: '%' + params.researcher + '%'});
    }
    if (params.text) {
      const text = '%' + params.text + '%';
      q = q.andWhere(new Brackets( qb => {
        qb.where('stock.comment Like :t OR stock.description LIKE :t',
          {t: text});
      } ));
    }
    if (params.mutation) {
      const text = '%' + params.mutation + '%';
      q = q.andWhere(new Brackets(qb => {
        qb.where('mutation.name LIKE :mt OR mutation.gene LIKE :mt OR mutation.comment LIKE :mt OR ' +
          'mutation.phenotype LIKE :mt OR mutation.morphantPhenotype LIKE :mt',
          { mt: text });
      }));
    }
    if (params.transgene) {
      const text = '%' + params.transgene + '%';
      q = q.andWhere(new Brackets(qb => {
        qb.where('transgene.descriptor LIKE :tt OR transgene.allele LIKE :tt OR ' +
          'transgene.plasmid LIKE :tt OR transgene.comment LIKE :tt',
          {tt: text});
      }));
    }
    if (params.tankName) {
      const text = params.tankName + '%';
      q = q.andWhere('tank.name LIKE :tn', {tn: text});
    }
    if (params.liveStocksOnly) {
      q = q.andWhere('swimmers.tank IS NOT NULL');
    }
    if (params.age) {
      const dob = moment().subtract(Number(params.age), 'days');
      if (params.ageModifier === 'or_older') {
        q = q.andWhere('fertilizationDate < :d', {d: dob.format('YYYY-MM-DD')});
      } else {
        q = q.andWhere('fertilizationDate > :d', {d: dob.format('YYYY-MM-DD')});
      }
    }
    const items = await q
      .getRawMany();
    return items.map(item => {
      return new StockReportDto(item);
    });
  }

  async test(id) {
    return 12;
  }
}
