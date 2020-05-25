import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToMany } from 'typeorm';
import {Expose, Type} from 'class-transformer';
import { Stock } from '../stock/stock.entity';

@Entity()
@Index(['allele', 'descriptor'], { unique: true })
@Index(['allele', 'descriptor', 'plasmid', 'comment', 'source'], { fulltext: true })
export class Transgene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    comment: 'Transgene descriptor which should use ZFIN nomenclature. Properly called genetic construct.',
  })
  descriptor: string;

  @Column({
    nullable: true,
    comment: 'Properly called a genomic feature name'
  })
  allele: string;

  @Column({
    nullable: true,
    unique: true,
    comment: 'an abbreviated name for use in space constrained areas.',
  })
  nickname: string;

  @Column({
    nullable: true,
    comment: 'Describes the source (lab or researcher) of the transgene.',
  })
  source: string;

  @Column({
    nullable: true,
  })
  plasmid: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 5000,
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

  @Type(() => Stock)
  @ManyToMany(type => Stock, stock => stock.transgenes)
  stocks: Stock[];

  isDeletable: boolean = false;

  isOwned(): boolean {
    return !!(this.serialNumber);
  }

  @Expose()
  get fullName(): string {
    const name: string[] = [];
    if (this.descriptor) { name.push(this.descriptor); }
    if (this.allele) { name.push(this.allele); }
    return name.join(': ');
  }

  @Expose()
  get name(): string {
    return this.fullName;
  }

  // This just makes a string that can be used as a tooltip when
  // hovering over a mutation in the GUI.
  // I'm really unhappy about this
  // a) because it duplicates pretty much all of the mutation data, and
  // b) because tooltips are really the domain of the client.
  // The alternative is that this gets computed on the client side.  But in order to do
  // THAT, I'd have to create a "real" object on the client side rather than just a DTO.
  // And doing that turns the client into a significantly more complicated thing that has
  // to have another whole layer of objects and converters.
  // So For now, I'll take the pain.
  @Expose()
  get tooltip(): string {
    const strings: string[] = [];
    if (this.source) {
      strings.push('source: ' + this.source);
    }
    if (this.plasmid) {
      strings.push('plasmid: ' + this.plasmid);
    }
    if (this.comment) {
      strings.push('comment: ' + this.comment.substr(0, 50));
    }
    return strings.join('\n');
  }
}
