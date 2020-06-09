import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class MutationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({unique: true})
  @Column()
  name: string;

  @Column({
    nullable: true,
    unique: true,
  })
  abbrv: string;

  @Column({
    nullable: true,
  })
  description: string;
}
