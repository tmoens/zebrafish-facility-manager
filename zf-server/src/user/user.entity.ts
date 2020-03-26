import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column({
    nullable: true,
    unique: true,
  })
  email: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({
    comment: ' stored encrypted'
  })
  password: string;

  @Exclude({ toPlainOnly: true })
  @Column({
    comment: 'salt differs for each user.'
  })
  salt: string;


}
