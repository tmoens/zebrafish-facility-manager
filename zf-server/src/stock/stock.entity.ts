import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {Mutation} from '../mutation/mutation.entity';
import {Transgene} from '../transgene/transgene.entity';
import {Stock2tank} from '../stock2tank/stock-to-tank.entity';
import {User} from '../user/user.entity';

@Entity({
  orderBy: {number: 'DESC', subNumber: 'ASC'},
})
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  // Note: the name is always computed from the stock number and subStock number
  // so it should not be in the database.  But for historical reasons it is.
  @Index({ unique: true })
  @Column({
    comment: 'The unique human readable name for this stock.',
  })
  name: string;

  @Column({
    type: 'int',
    comment: 'Stock number.',
  })
  number: number;

  @Column({
    type: 'int',
    comment: 'Sub-stock number.',
    name: 'subnumber',
  })
  subNumber: number;

  @Column({
    nullable: true,
    comment: 'A description of the stock limited to fit on a tank label.',
  })
  description: string;

  @Column({
    nullable: true,
    unique: true,
    comment: 'an abbreviated name for use in space constrained areas.',
  })
  nickname: string;

  @Column({
    type: 'date',
    nullable: true,
    comment: 'The date on which the stock was fertilized.',
  })
  fertilizationDate: string;

  // Vestigial: the PI is now a reference to a User object.
  @Exclude()
  @Column({
    nullable: true,
    comment: 'Primary investigator for this stock.',
  })
  pi: string;

  @Type(() => User)
  @ManyToOne(type => User)
  @JoinColumn({
    name: 'piId',
  })
  piUser: User;

  // Expose the id of the PI without having to join the tables.
  // Allows efficient import of existing stocks
  @Column({nullable: true})
  piId: string;

  // Vestigial: the researcher is now a reference to a User object.
  @Exclude()
  @Column({
    nullable: true,
    comment: 'Who the stock is for.',
  })
  researcher: string;

  @Type(() => User)
  @ManyToOne(type => User)
  @JoinColumn({
    name: 'researcherId',
  })
  researcherUser: User;

  // Expose the internal id of the researcher without having to join the tables.
  // Allows efficient import of existing stocks
  @Column({nullable: true})
  researcherId: string;


  // Expose the internal id of the mother without having to join the tables.
  // Makes searches for children of a stock much more efficient.
  @Column({nullable: true})
  matIdInternal: number;

  @Type(() => Stock)
  @ManyToOne(type => Stock)
  @JoinColumn({
    name: 'matIdInternal',
  })
  matStock: Stock;

  @Column({
    nullable: true,
    name: 'matIdExternal',
    comment: 'Reference to a maternal stock in some other system. Just a bit of text.',
  })
  externalMatId: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Reference to an maternal stock that is an ENU mutagenized fish. Not used.',
    name: 'matIdENU',
  })
  @Exclude()
  enuMatId: number;

  @Column({
    nullable: true,
    comment: 'A description of the maternal stock, if that stock is external.',
    name: 'matDescription',
  })
  externalMatDescription: string;

  @Type(() => Stock)
  @ManyToOne(type => Stock)
  @JoinColumn({
    name: 'patIdInternal',
  })
  patStock: Stock;

  // Expose the internal id of the father without having to join the tables.
  // Makes searches for children of a stock much more efficient.
  @Column({nullable: true})
  patIdInternal: number;

  @Column({
    nullable: true,
    name: 'patIdExternal',
    comment: 'Reference to a paternal stock in some other system. Just a bit of text.',
  })
  externalPatId: string;

  @Column({
    type: 'int',
    nullable: true,
    name: 'patIdENU',
    comment: 'Reference to an paternal stock that is an ENU mutagenized fish. Not used.',
  })
  @Exclude()
  enuPatId: number;

  @Column({
    nullable: true,
    name: 'patDescription',
    comment: 'A description of the maternal stock, if that stock is external.',
  })
  externalPatDescription: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 5000,
  })
  comment: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'createDate',
    nullable: true,
  })
  @Exclude()
  creationDate: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'modificationDate',
    nullable: true,
  })
  @Exclude()
  updateDate: Date;

  @Type(() => Mutation)
  @ManyToMany(type => Mutation, mutation => mutation.stocks)
  @JoinTable({
    name: 'mapstock2mutation',
    joinColumn: {
      name: 'stockId',
    },
    inverseJoinColumn: {
      name: 'mutantId',
    },
  })
  mutations: Mutation[];

  @Type(() => Transgene)
  @ManyToMany(type => Transgene, transgene => transgene.stocks)
  @JoinTable({
    name: 'mapstock2transgene',
    joinColumn: {
      name: 'stockId',
    },
    inverseJoinColumn: {
      name: 'transgeneId',
    },
  })
  transgenes: Transgene[];

  @Type(() => Stock2tank)
  @OneToMany(type => Stock2tank, s2t => s2t.stock)
  swimmers: Stock2tank[];

  nextSubStockNumber: number;
  offspringCount: number;
  offspring: Stock[];
  isDeletable: boolean;
  parentsEditable: boolean;
  alleleSummary: string;

  setName() {
    this.name = String(this.number);
    if (this.subNumber > 9) {
      this.name = this.name.concat('.', String(this.subNumber));
      return;
    }
    if (this.subNumber > 0) {
      this.name = this.name.concat('.0', String(this.subNumber));
    }
  }

  @Expose()
  get fullName(): string {
    return this.name + ' ' + this.description;
  }

  static convertNameToNumbers(stockName: string): { stockNumber: number, substockNumber: number } {
    const x: string = String(stockName);
    // stock name has the form nnnn or nnnn.mm  where the nnnn part forms the
    // stock's number and the mm part forms the stock's subnumber
    const simpleStock = x.match(/^(\d*)$/);
    if (simpleStock) return {stockNumber: Number(simpleStock[1]), substockNumber: 0};

    const substock = x.match(/^(\d*)\.(\d\d)$/);
    if (substock) return {stockNumber: Number(substock[1]), substockNumber: Number(substock[2])}

    return null;
  }
}
