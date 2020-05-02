import {
  Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, Index,
  ManyToOne, ManyToMany, JoinTable, JoinColumn, OneToMany,
} from 'typeorm';
import { Exclude, Transform, Type } from 'class-transformer';
import { Mutation } from '../mutation/mutation.entity';
import { Transgene } from '../transgene/transgene.entity';
import { Background } from '../background/background.entity';
import { Stock2tank } from '../stock2tank/stock-to-tank.entity';
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
    type: 'varchar',
    length: 20,
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
    type: 'varchar',
    nullable: true,
    length: 60,
    comment: 'A description of the stock limited to fit on a tank label.',
  })
  description: string;

  @Column({
    type: 'date',
    nullable: true,
    comment: 'The date on which the stock was fertilized.',
  })
  @Transform(value => (value) ? String(value).substr(0, 10) : null, { toClassOnly: true })
  fertilizationDate: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 25,
    comment: 'Primary investigator for this stock.',
  })
  pi: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    comment: 'Who the stock is for.',
  })
  researcher: string;

  @Type(() => Background)
  @ManyToOne(type => Background)
  @JoinColumn({
    name: 'background',
  })
  background: Background;

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
    type: 'varchar',
    nullable: true,
    length: 20,
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
    type: 'varchar',
    nullable: true,
    length: 40,
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
    type: 'varchar',
    nullable: true,
    length: 20,
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
    type: 'varchar',
    nullable: true,
    length: 40,
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

  // TODO ApiModelProperty indicating type causes the SwaggerUI to break when
  // showing the Response structure for this query. May be related to the
  // structure of Stock2Tank. Anyway, no harm to comment it out for now.
  // @ApiModelPropertyOptional({type: [Stock2tank]})
  @Type(() => Stock2tank)
  @OneToMany(type => Stock2tank, s2t => s2t.stock)
  swimmers: Stock2tank[];

  nextSubStockNumber: number;
  offspringCount: number;
  offspring: Stock[];
  isDeletable: boolean;
  parentsEditable: boolean;

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
}
