import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToMany } from 'typeorm';
import { Type } from 'class-transformer';
import { Stock } from '../stock/stock.entity';

@Entity()
@Index(['allele', 'descriptor'], { unique: true })
@Index(['allele', 'descriptor', 'plasmid', 'comment', 'source'], { fulltext: true })
export class Transgene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 50,
    comment: 'Transgene descriptor which should use ZFIN nomenclature.',
  })
  descriptor: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  allele: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 40,
    comment: 'Describes the source (lab or researcher) of the transgene.',
  })
  source: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 250,
  })
  plasmid: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
    comment: 'Notes pertaining to this transgene.',
  })
  comment: string;

  @Column({
    type: 'int',
    nullable: true,
    unique: true,
    comment: 'This is the serial number for "owned" transgenes.',
  })
  serialNumber: number;

  @Type(() => Stock)
  @ManyToMany(type => Stock, stock => stock.transgenes)
  stocks: Stock[];

  isDeletable: boolean = false;

  isOwned(): boolean {
    return !!(this.serialNumber);
  }
}
