import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

/**
 * This is a particular named genetic background that a stock can have.
 * This should only be used for fish at the "root" of a lineage.
 *
 * The background of any stock under the root is calculated from the background
 * of the root stocks.
 *
 */
@Entity()

export class Background {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 5,
    comment: 'A unique short name for the background used where display space is tight.',
  })
  shortName: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 40,
    comment: 'The unique name for the background.',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 250,
  })
  description: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 150,
  })
  url: string;
}
