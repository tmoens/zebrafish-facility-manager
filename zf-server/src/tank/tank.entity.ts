import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { Stock2tank } from '../stock2tank/stock-to-tank.entity';

@Entity({
  orderBy: {
    sortOrder: 'ASC',
  }
})
export class Tank {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({unique: true})
  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  rack: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  shelf: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  slot: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  comment: string;

  @Column({
    default: false,
    comment: 'for tanks that are really many tanks like Nursery',
  })
  isMultiTank: boolean;

  @Index('sortOrderIndex')
  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'for correct ordering of tanks'
  })
  sortOrder: string;

  @OneToMany(type => Stock2tank, s2t => s2t.tank)
  swimmers: Stock2tank[];
}
