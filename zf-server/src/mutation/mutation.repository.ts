import {Brackets, EntityRepository, Repository} from 'typeorm';
import {Mutation} from './mutation.entity';
import {MutationFilter} from './mutation.filter';
import {AutoCompleteOptions} from "../helpers/autoCompleteOptions";

@EntityRepository(Mutation)
export class MutationRepository extends Repository<Mutation> {
  constructor() {
    super();
  }

  async findAll() {
    return await this.createQueryBuilder('m')
      .orderBy('m.name')
      .getMany();
  }

  async findFiltered(filter: MutationFilter): Promise<any> {
    if (!filter) { filter = {}; }
    let q = this.createQueryBuilder('m').where('1');
    if (filter.gene) {
      q = q.andWhere('m.gene Like :g', {g: '%' + filter.gene + '%'});
    }
    if (filter.researcher) {
      q = q.andWhere('m.researcher Like :r', {r: '%' + filter.researcher + '%'});
    }
    if (filter.mutationType) {
      q = q.andWhere('m.mutationType Like :mt', {mt: '%' + filter.mutationType + '%'});
    }
    if (filter.screenType) {
      q = q.andWhere('m.screenType Like :st', {st: '%' + filter.screenType + '%'});
    }
    if (filter.spermFreeze) {
      q = q.andWhere('m.spermFreezePlan Like :sf', {sf: '%' + filter.spermFreeze + '%'});
    }
    if (filter.ownedMutationsOnly) {
      q = q.andWhere('m.serialNumber > 0');
    }
    if (filter.freeText) {
      const freeText = '%' + filter.freeText + '%';
      q = q.andWhere(new Brackets( qb => {
        qb.where('m.comment LIKE :t OR m.morphantPhenotype LIKE :t OR m.phenotype LIKE :t ' +
          'OR m.gene LIKE :t OR m.name LIKE :t OR m.alternateGeneName LIKE :t ' +
          'OR m.nickname LIKE :t',
          {t: freeText});
      } ));
    }
    return await q.orderBy('m.gene')
      .addOrderBy('m.name')
      .getMany();
  }

  // an alternative filtering mechanism that searches multiple fields using just a string filter
  async filterByString(filterString: string = null) {
    const freeText = '%' + filterString + '%';
    return await this.createQueryBuilder('m')
      .where ('m.name LIKE :t ' +
        'OR m.gene LIKE :t ' +
        'OR m.alternateGeneName LIKE :t ' +
        'OR m.phenotype LIKE :t ' +
        'OR m.morphantPhenotype LIKE :t ' +
        'OR m.nickname LIKE :t ' +
        'OR m.researcher LIKE :t ' +
        'OR m.comment LIKE :t', {t: freeText})
      .orderBy('m.gene')
      .addOrderBy('m.name')
      .getMany();
  }

  // You cant delete a mutation if there exists a stock that has said mutation.
  // A simpler and more efficient way to do this would be to query the table
  // that joins stocks and mutations for any rows with the particular mutation
  // id using raw SQL, but that would circumvent TYPEORM and would mean extra
  // work if you ever change any of the entity definitions.
  async isDeletable(id: number): Promise<boolean> {
    const x = await this.createQueryBuilder('m')
      .select('m.id')
      .innerJoin('m.stocks', 'stock')
      .where('m.id = :id', { id })
      .getOne();
    return !(x);
  }

  async findByName(name: string): Promise<Mutation> {
    return await this.findOne({ where: {name}});
  }

  async findById(id: number): Promise<Mutation> {
    return await this.findOne(id);
  }

  // values that can be used to auto-complete various fields in the GUI
  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    const options: AutoCompleteOptions = {} as AutoCompleteOptions;
    options.name = await this.getAutocompleteOption('name');
    options.gene = await this.getAutocompleteOption('gene');
    options.researcher = await this.getAutocompleteOption('researcher');
    options.mutationType = await this.getAutocompleteOption('mutationType');
    options.screenType = await this.getAutocompleteOption('screenType');
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

  // What is the next available serial number for "owned" mutations
  async getMaxSerialNumber(): Promise<number> {
    const latest = await this.createQueryBuilder('m')
      .select('MAX(m.serialNumber)', 'max')
      .getRawOne();
    return  Number(latest.max) + 1;
  }
}
