import {EntityRepository, Repository} from 'typeorm';
import {Transgene} from './transgene.entity';
import {TransgeneFilter} from './transgene.filter';
import {Logger} from "winston";
import {Inject} from "@nestjs/common";
import {AutoCompleteOptions} from "../helpers/autoCompleteOptions";

@EntityRepository(Transgene)
export class TransgeneRepository extends Repository<Transgene> {
  constructor(
    @Inject('winston') private readonly logger: Logger
  ) {
    super();
  }

  // TODO upgrade MariaDB to 10.5+, then convert to full-text searches. Just to learn.
  async findFiltered(filter: TransgeneFilter): Promise<any> {
    let q = this.createQueryBuilder('m').where('1');
    if (filter.spermFreeze) {
      q = q.andWhere('m.spermFreezePlan Like :sf', {sf: '%' + filter.spermFreeze + '%'});
    }

    if (filter.text) {
      q = q.andWhere(
        'm.allele Like :t OR ' +
        'm.descriptor LIKE :t OR ' +
        'm.nickname LIKE :t OR ' +
        'm.source LIKE :t OR ' +
        'm.comment LIKE :t OR ' +
        'm.plasmid LIKE :t',
        { t: '%' + filter.text + '%' },
      );
    }
    return await q
      .orderBy('m.descriptor')
      .addOrderBy('m.allele')
      .getMany();
  }

  async findByName(allele: string): Promise<Transgene> {
    return await this.findOne({ where: { allele } });
  }

  // Kludge alert. When the client asks for a transgene by Id, I do an bit of
  // groundwork for the client to figure out if that transgene is deletable or not.
  // This makes it easy for the client to enable or disable a deletion operation
  // in the GUI without having to make a second call to figure out if the transgene
  // is deletable.  The cost is that I have a field called isDeletable stuffed
  // in to the transgene which a) is not populated correctly for any other request
  // and b) is calculated by the repo and not by the transgene itself (because
  // the transgene class does not have access to the repo to make the required query)
  // So it is all very ugly.
  async findById(id: number): Promise<Transgene> {
    const m: Transgene = await this.findOne(id);
    m.isDeletable = await this.isDeletable(id);
    return m;
  }

  // You cant delete a transgene if there exists a stock that has said transgene.
  // A simpler and more efficient way to do this would be to query the table
  // that joins stocks and transgenes for any rows with the particular transgene
  // id using raw SQL, but that would circumvent TYPEORM and would mean extra
  // work if you ever change any of the entity definitions.
  async isDeletable(id: number): Promise<boolean> {
    const x = await this.createQueryBuilder('m')
      .select('m.id')
      .innerJoin('m.stocks', 'stock')
      .where('m.id = :id', { id })
      .getOne();
    return !x;
  }

  // What is the next available sequence number for "owned" transgenes
  async getMaxSerialNumber(): Promise<number> {
    const latest = await this.createQueryBuilder('m')
      .select('MAX(m.serialNumber)', 'max')
      .getRawOne();
    return Number(latest.max) + 1;
  }

  // values that can be used to auto-complete various fields in the GUI
  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    const options: any = {};
    options.nameValidation = await this.getValidationData();
    options.source = await this.getAutocompleteOption('source');
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

  // The allele/descriptor pair must be unique. The client may want
  // to see what the current list is so it can validate a creation
  // operation synchronously.
  async getValidationData(): Promise<string[]> {
    const list = await this.createQueryBuilder('i')
      .select(`i.descriptor`, 'descriptor')
      .addSelect(`i.allele`, 'allele')
      .orderBy(`i.descriptor`)
      .addOrderBy('i.allele')
      .getRawMany();
    return list.map((i: any) => i.allele + ': ' + i.descriptor);
  }
}
