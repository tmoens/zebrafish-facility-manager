import { Entity, Column, ManyToOne, JoinColumn, OneToOne, UpdateDateColumn } from 'typeorm';
import { Stock } from '../stock/stock.entity';
import { Exclude } from 'class-transformer';
import { Tank } from '../tank/tank.entity';

/**
 * This models the relationship between a given tank and the stock that is
 * swimming in the tank.
 *
 * It is not modeled like normal TypeORM relationships because the relationship
 * not only has references to a stock and a tank but also ancillary data that
 * pertains to the relationship.  E.g. the count of fish in the tank.
 */
@Entity()

export class Stock2tank {
  @Column({
    primary: true,
    nullable: false,
  })
  stockId: number;

  @Column({
    primary: true,
    nullable: false,
  })
  tankId: number;

  @ManyToOne(type => Stock, stock => stock.swimmers,
    {cascade: true})
  stock: Stock;

  @ManyToOne(type => Tank, tank => tank.swimmers)
  tank: Tank;

  @Column({
    type: 'int',
    default: 0,
    name: 'num',
    comment: 'How many fish are swimming in the tank.',
  })
  number: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 300,
  })
  comment: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'modificationDate',
    nullable: true,
  })
  @Exclude()
  updateDate: Date;
}
