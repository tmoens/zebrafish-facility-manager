import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '../config/config.service';
import {StockRepository} from './stock.repository';
import {GenericService} from '../Generics/generic-service';
import {Stock} from './stock.entity';
import {plainToClassFromExist} from 'class-transformer';
import {Logger} from 'winston';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {UserService} from '../user/user.service';
import {MutationService} from '../mutation/mutation.service';
import {TransgeneService} from '../transgene/transgene.service';
import {Transgene} from '../transgene/transgene.entity';
import {User} from '../user/user.entity';
import {Mutation} from '../mutation/mutation.entity';
import {StockImportDto} from './stock-import-dto';

@Injectable()
export class StockService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectRepository(StockRepository)
    private readonly repo: StockRepository,
    private readonly userService: UserService,
    private readonly mutationService: MutationService,
    private readonly transgeneService: TransgeneService,
  ) {
    super(logger);
  }

  //========================= Searches =======================
  async findByName(name: string): Promise<Stock> {
    return await this.repo.findOne({where: {name: name}});
  }


  //========================= Validation =======================
  async doesUserExist(username: string): Promise<User> {
    return this.userService.findByUserName(username);
  }

  async doesMutationExist(name: string): Promise<Mutation> {
    return this.mutationService.findByName(name);
  }

  async doesTransgeneExist(allele: string): Promise<Transgene> {
    return this.transgeneService.findByName(allele);
  }

  async doesStockNameExist(name: string): Promise<Stock> {
    return this.findByName(name);
  }

  async mustExist(stockId: number): Promise<Stock> {
    const stock: Stock = await this.repo.findOne(stockId);
    if (stock) {
      return stock;
    } else {
      const message: string = 'Stock does not exist. id: ' + stockId;
      this.logger.error(message,);
      throw new BadRequestException(message);
    }
  }

  async getById(id: number): Promise<Stock> {
    return this.mustExist(id);
  }

  // Importing a stock can become quite complicated because we import all the
  // relationships between that stock and other objects (parents, researcher,
  // transgenes and mutations). Further, we get the related objects
  // by their unique name and not by their Id, so we have to lookup
  // the related objects before associating them with the stock.
  // So, most of this code is finding the related objects thus ensuring that
  // they exist.
  async import(dto: StockImportDto): Promise<Stock> {
    const problems: string[] = [];
    const candidate = new Stock();
    candidate.description = dto.description;
    candidate.comment = dto.comment;

    // The stock we are importing must have a name, the name must be valid,
    // and the name can not already exist.
    if (!dto.name) {
      this.logAndThrowException(`Cannot import a stock without a name.`);
    } else {
      const stockNum = Stock.convertNameToNumbers(dto.name);
      if (stockNum) {
        candidate.name = dto.name;
        candidate.number = stockNum.stockNumber;
        candidate.subNumber = stockNum.substockNumber;
      } else {
        problems.push(`Cannot import stock named ${dto.name}. Name should be digit*.dd or digit*`);
      }
      const stock: Stock = await this.doesStockNameExist(dto.name);
      if (stock) problems.push(`Cannot import stock ${dto.name}, it already exists.`);
    }

    // The stock we are importing must have a fertilization date
    if (!dto.fertilizationDate) {
      problems.push(`Cannot import a stock without a fertilization date.`);
    }

    // Parents and Fertilization Date
    candidate.externalMatDescription = dto.externalMomDescription;
    candidate.externalMatId = dto.externalMomName;
    candidate.externalPatDescription = dto.externalDadDescription;
    candidate.externalPatId = dto.externalDadName;
    candidate.fertilizationDate = dto.fertilizationDate;

    // For substocks, parental information and fertilization date must be the same as the base stock
    if (candidate.subNumber > 0) {
      const baseStock = await this.doesStockNameExist(String(candidate.number));
      if (baseStock) {
        const problem = this.importSubstock(baseStock, candidate);
        if (problem) problems.push(problem);
      }
    }

    // For regular (base) stocks, we need to validate that internal parents exist
    if (!candidate.subNumber) {
      // If there is an internal
      if (dto.internalDad) {
        const dad = await this.doesStockNameExist(String(dto.internalDad));
        if (dad) {
          candidate.patIdInternal = dad.id;
        } else {
          problems.push(`Cannot import stock ${dto.name}, internal dad ${dto.internalDad} does not exist.`);
        }
        if (candidate.externalPatDescription || candidate.externalPatId) {
          problems.push(`Cannot import stock ${dto.name}, it has internal AND external dad information`);
        }
      }
      if (dto.internalMom) {
        const mom = await this.doesStockNameExist(String(dto.internalMom));
        if (mom) {
          candidate.matIdInternal = mom.id;
        } else {
          problems.push(`Cannot import stock ${dto.name}, internal mom ${dto.internalMom} does not exist.`);
        }
        if (candidate.externalMatDescription || candidate.externalMatId) {
          problems.push(`Cannot import stock ${dto.name}, it has internal AND external mom information`);
        }
      }
    }

    if (dto.researcherUsername) {
      const researcher = await this.doesUserExist(dto.researcherUsername);
      if (researcher) {
        candidate.researcherId = researcher.id;
      } else {
        problems.push(`Cannot import stock ${dto.name}, researcher ${dto.researcherUsername} does not exists.`);
      }
    }
    if (dto.piUsername) {
      const pi = await this.doesUserExist(dto.piUsername);
      if (pi) {
        candidate.piId = pi.id;
      } else {
        problems.push(`Cannot import stock ${dto.name}, primary investigator ${dto.piUsername} does not exists.`);
      }
    }

    if (dto.alleles) {
      for (const allele of dto.alleles.split(';')) {
        const mutation = await this.doesMutationExist(allele);
        if (mutation) {
          if (!candidate.mutations) candidate.mutations = [];
          candidate.mutations.push(mutation);
        } else {
          const tg = await this.doesTransgeneExist(allele);
          if (tg) {
            if (!candidate.transgenes) candidate.transgenes = [];
            candidate.transgenes.push(tg);
          } else {
            problems.push(`Cannot import stock ${dto.name}, allele ${allele} does not exists.`);
          }
        }
      }
    }

    // if we have encountered problems, time to give up;
    if (problems.length > 0) {
      this.logAndThrowException(problems.join('; '));
    }


    // await this.validateAges(candidate);
    return await this.repo.save(candidate);
  }

  // When importing a substock, if you are given data about the substock,
  // it must match the data about the base stock.  More concretely a substock must
  // have the same parental info and the same birthdate as the base stock.
  // This is because the base stock ad all its substocks are necessarily siblings.
  // On the other hand, if you are not given data about the substock, copy it from
  // the base stock.
  importSubstock(base: Stock, sub: Stock): string {
    const problems: string[] = [];
    const atts = ['matIdInternal', 'patIdInternal', 'externalMatId', 'externalPatId',
      'externalMatDescription', 'externalPatDescription', 'fertilizationDate'];
    atts.map((attribute: string) => {
      if (sub[attribute]) {
        if (sub[attribute] !== base[attribute]) {
          problems.push(`Substock ${sub.name} has different ${attribute} than its base stock.`);
        }
      } else {
        sub[attribute] = base[attribute];
      }
    });

    if (problems.length > 0) return problems.join('; ');
    else return null;
  }


  // For creation, create a fresh stock, merge in the DTO and save.
  async validateAndCreate(dto: any, isSubStock: boolean = false): Promise<Stock> {
    convertEmptyStringToNull(dto);
    // New stocks should not have transgenes, mutations or swimmers,
    // so ignore them if they are present in the incoming dto
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
        this.logAndThrowException(msg);
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
      stock.matStock = await this.mustExist(stock.matIdInternal);
      stock.externalMatId = null;
      stock.externalMatDescription = null;
    }
    if (stock.patIdInternal) {
      stock.patStock = await this.mustExist(stock.patIdInternal);
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
      this.logAndThrowException('Child stock (' + child.name + ') older than ' +
        'parent stock (' + parent.name + ').');
    }
  }

  // For update, lookup the stock, merge in the DTO and save.
  // Note: we do not update Swimmers with this method, so if swimmers come in the
  // DTO, remove them. FWIW relationships to Transgenes and Mutations and parents
  // *are* updated.
  // TODO dont let the parents change if they should not.
  async validateAndUpdate(dto: any): Promise<any> {
    convertEmptyStringToNull(dto);
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

    delete candidate.swimmers;
    return await this.repo.save(candidate);
  }

  // For deletion, check that the stock exists, and that deletion is sensible.
  async validateAndRemove(stockId: any): Promise<any> {
    const stock: Stock = await this.repo.getStockWithRelations(stockId);
    if (!stock.isDeletable) {
      this.logAndThrowException('Attempt to delete stock that either has descendants, or is alive in ' +
        'some tank or has subStocks.');
    }
    return await this.repo.remove(stock);
  }
}
