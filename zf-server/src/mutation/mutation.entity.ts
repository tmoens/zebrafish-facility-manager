import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {Stock} from '../stock/stock.entity';

@Entity()
export class Mutation {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({
    comment: 'The unique human readable name for this mutation.',
  })
  name: string;

  @Column({
    nullable: true,
    unique: true,
    comment: 'an abbreviated name for use in space constrained areas.',
  })
  nickname: string;

  // This field began life as "researcher" field because it was meant to be
  // used as the researcher interested in the mutation.  However, it evolved
  // to be come "the place or person we got the mutation from originally"
  // The UI calls it "source", but we did not change the db schema.
  @Column({
    nullable: true,
    comment: 'The source (researcher/lab/organization) of this mutation.',
  })
  researcher: string;

  @Column({
    nullable: true,
    name: 'screen_type',
    comment: 'The method used to create this mutation.',
  })
  screenType: string;

  @Column({
    nullable: true,
    name: 'mutation_type',
    comment: 'What kind of mutation - stop/splice/missense, etc.',
  })
  mutationType: string;

  @Column({
    nullable: true,
    comment: 'The gene affected by this mutation.',
  })
  gene: string;

  @Column({
    nullable: true,
    name: 'alternate_gene_name',
    comment: 'An alternate name for the gene affected by this mutation.',
  })
  alternateGeneName: string;

  @Column({
    nullable: true,
    name: 'actg_change',
    comment: 'The nucleotide change caused y the mutation.',
  })
  actgChange: string;

  @Column({
    nullable: true,
    name: 'aa_change',
    comment: 'The change in amino acid sequence which causes this mutation.',
  })
  aaChange: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 5000,
    comment: 'Notes pertaining to this mutation.',
  })
  comment: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'thaw_date',
  })
  thawDate: Date;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'If the male was one of the TILLing ENU mutagenized males, then this is its id.',
    name: 'tilling_male_number',
  })
  tillingMaleNumber: number;

  @Column({
    type: 'date',
    nullable: true,
    name: 'availability_date',
  })
  @Exclude()
  availabilityDate: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
  })
  phenotype: string;

  // Storing the URL was a bad idea and is superceded by storing the ZFIN Id
  // which can easily be converted to a URL.
  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  zfinURL: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  zfinId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
    name: 'morphant_phenotype',
  })
  morphantPhenotype: string;

  @Column({
    nullable: true,
    name: 'sperm_freeze_plan',
  })
  spermFreezePlan: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
    name: 'vials_frozen',
  })
  vialsFrozen: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'general_availability',
  })
  @Exclude()
  generalAvailabilityDate: Date;

  @Type(() => Stock)
  @ManyToMany(type => Stock, stock => stock.mutations)
  stocks: Stock[];

  @CreateDateColumn({
    type: 'timestamp',
    name: 'creation_date',
    nullable: true,
  })
  @Exclude()
  creationDate: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'modification_date',
    nullable: true,
  })
  @Exclude()
  updateDate: Date;

  @VersionColumn()
  @Exclude()
  version: number;
  @Index({ unique: true })

  @Column({
    type: 'int',
    nullable: true,
    comment: 'This is the serial number for "owned" mutants.',
  })
  serialNumber: number;

  isDeletable: boolean = false;

  isOwned(): boolean {
    return !!(this.serialNumber);
  }

  @Expose()
  get fullName(): string {
    if (this.nickname) {
      return this.nickname;
    } else {
      return this.gene + '^' + this.name;
    }
  }
}
