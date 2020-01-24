import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn, CreateDateColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { Exclude, Transform, Type } from 'class-transformer';
import { Stock } from '../stock/stock.entity';

@Entity()
export class Mutation {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 20,
    comment: 'The unique human readable name for this mutation.',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    comment: 'Researcher or owner of this mutation.',
  })
  researcher: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 25,
    name: 'screen_type',
    comment: 'The method used to create this mutation.',
  })
  screenType: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 15,
    name: 'mutation_type',
    comment: 'What kind of mutation - stop/splice/missense, etc.',
  })
  mutationType: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    comment: 'The gene affected by this mutation.',
  })
  gene: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'alternate_gene_name',
    comment: 'An alternate name for the gene affected by this mutation.',
  })
  alternateGeneName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 10,
    name: 'actg_change',
    comment: 'The nucleotide change caused y the mutation.',
  })
  actgChange: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 10,
    name: 'aa_change',
    comment: 'The change in amino acid sequence which causes this mutation.',
  })
  aaChange: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
    comment: 'Notes pertaining to this mutation.',
  })
  comment: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'thaw_date',
  })
  @Transform(value => (value) ? String(value).substr(0, 10) : null, { toClassOnly: true })
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

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
    name: 'morphant_phenotype',
  })
  morphantPhenotype: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 15,
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
}
