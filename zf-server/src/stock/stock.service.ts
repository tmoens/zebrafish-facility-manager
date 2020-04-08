import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '../config/config.service';
import {StockRepository} from './stock.repository';
import {GenericService} from '../Generics/generic-service';
import {Stock} from './stock.entity';
import {plainToClassFromExist} from 'class-transformer';
import {Logger} from "winston";

@Injectable()
export class StockService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectRepository(StockRepository)
    private readonly repo: StockRepository,
  ) {
    super();
  }

  // For creation, create a fresh stock, merge in the DTO and save.
  // TODO watch for fertilization date irregularities (e.g. younger parent)
  async validateAndCreate(dto: any, isSubStock: boolean = false): Promise<Stock> {
    // New stocks should not have transgenes, mutations or swimmers,
    // so get rid of them if they are present in the incoming dto
    this.ignoreAttribute(dto, 'id');
    this.ignoreAttribute(dto, 'transgenes');
    this.ignoreAttribute(dto, 'mutations');
    this.ignoreAttribute(dto, 'swimmers');

    // Parents are identified via patIdInternal and matIdInternal id references
    // and NOT through full fledged parental stocks.  So get rid of matStock
    // and patStock objects.
    this.ignoreAttribute(dto, 'patStock');
    this.ignoreAttribute(dto, 'matStock');

    let candidate: Stock = new Stock();
    candidate = plainToClassFromExist(candidate, dto);

    // If creating a sub-stock, the subStock number is the next available
    // subStock for the given stock number.
    if (isSubStock) {
      const baseStock: Stock = await this.repo.findOne({ number: candidate.number, subNumber: 0 },
        {relations: ['mutations', 'transgenes']});
      if (!baseStock) {
        const msg =
          'Trying to create subStock, but stock ' +
          candidate.number +
          ' does not exist.';
        this.logger.error(msg);
        throw new BadRequestException('Bad Request', msg);
      }
      candidate.subNumber = await this.repo.getNextSubStockNumber(candidate.number);
      // For sub-stock creation, take all the transgenes and mutations from the original stock
      candidate.mutations = baseStock.mutations;
      candidate.transgenes = baseStock.transgenes;
    } else {
      // Creating a new stock
      candidate.number = await this.repo.getNextStockNumber();
      candidate.subNumber = 0;
    }
    candidate.setName();

    await this.setParents(candidate);
    // For stock creation (i.e. not substock) we should inherit
    // all transgenes and mutations from the parents. Avoid duplicates.
    if (!isSubStock) {
      candidate.mutations = [];
      candidate.transgenes = [];
      if (candidate.matIdInternal) {
        const ms: Stock = await this.repo.getStockGenetics(candidate.matIdInternal);
        candidate.transgenes = ms.transgenes;
        candidate.mutations = ms.mutations;
      }
      if (candidate.patIdInternal) {
        const ps: Stock = await this.repo.getStockGenetics(candidate.patIdInternal);
        for (const mut of ps.mutations) {
          if (candidate.mutations.filter(m => mut.id === m.id).length === 0) {
            candidate.mutations.push(mut);
          }
        }
        for (const tg of ps.transgenes) {
          if (candidate.transgenes.filter(t => tg.id === t.id).length === 0) {
            candidate.transgenes.push(tg);
          }
        }
      }
    }

    await this.validateAges(candidate);

    // If creating a stock, the stock number is sequential and the sub-stock is 0.
    return await this.repo.save(candidate);
  }

  async setParents(stock: Stock) {
    delete stock.matStock;
    delete stock.patStock;
    if (stock.matIdInternal) {
      const matStock = await this.repo.mustExist(stock.matIdInternal);
      stock.matStock = matStock;
      stock.externalMatId = null;
      stock.externalMatDescription = null;
    }
    if (stock.patIdInternal) {
      const patStock = await this.repo.mustExist(stock.patIdInternal);
      stock.patStock = patStock;
      stock.externalPatId = null;
      stock.externalPatDescription = null;
    }
  }

  async validateAges(stock: Stock) {
    if (stock.matStock) {
      this.validateFertilizationDates(stock, stock.matStock);
    }
    if (stock.patIdInternal) {
      this.validateFertilizationDates(stock, stock.patStock);
    }
    const kids: Stock[] = await this.repo.getOffspring(stock.id);
    for (const kid of kids) {
      this.validateFertilizationDates(kid, stock);
    }
  }

  validateFertilizationDates(child: Stock, parent: Stock) {
    if (child.fertilizationDate &&
      parent.fertilizationDate &&
      child.fertilizationDate <= parent.fertilizationDate) {
      const msg: string = 'Child stock (' + child.name + ') older than ' +
        'parent stock (' + parent.name + ').';
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
  }

  // For update, lookup the stock, merge in the DTO and save.
  // Note: we do not update Swimmers with this method, so if swimmers come in the
  // DTO, remove them. FWIW relationships to Transgenes and Mutations and parents
  // *are* updated.
  // TODO dont let the parents change if they should not.
  async validateAndUpdate(dto: any): Promise<any> {
    // the client is not permitted to change the stock name, number or subNumber
    // so if a client sends any of those, just ignore them.
    this.ignoreAttribute(dto, 'name');
    this.ignoreAttribute(dto, 'number');
    this.ignoreAttribute(dto, 'subNumber');

    this.mustHaveAttribute(dto, 'id');
    let candidate = await this.repo.getStockWithRelations(dto.id);

    candidate = plainToClassFromExist(candidate, dto);

    await this.setParents(candidate);
    await this.validateAges(candidate);

    await delete candidate.swimmers;
    return await this.repo.save(candidate);
  }

  // For deletion, check that the stock exists, and that deletion is sensible.
  async validateAndRemove(stockId: any): Promise<any> {
    const stock: Stock = await this.repo.getStockWithRelations(stockId);
    if (!stock.isDeletable) {
      const msg = 'Attempt to delete stock that either has descendants, or is alive in ' +
        'some tank or has subStocks.';
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
    return await this.repo.remove(stock);
  }
}
