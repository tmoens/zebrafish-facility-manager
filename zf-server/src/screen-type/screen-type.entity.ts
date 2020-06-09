import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class ScreenType {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({unique: true})
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;
}
