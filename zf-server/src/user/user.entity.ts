import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import {raw} from "@hapi/joi";
import {GUEST_ROLE} from "../common/auth/zf-roles";
import {random_password_generate} from "../helpers/pasword-generator";
const crypto = require('crypto');

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

  @Column({nullable: true})
  phone: string;

  @Column({nullable: true})
  name: string;

  @Column({
    nullable: false,
    default: GUEST_ROLE,
  })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  passwordChangeRequired: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({
    comment: ' stored encrypted'
  })
  password: string;

  @Exclude()
  @Column({
    comment: 'salt differs for each user.'
  })
  salt: string;

  initializeSalt() {
    this.salt = crypto.randomBytes(16).toString('hex');
  }

  setPassword(rawPassword: string) {
    this.password = this.encryptPassword(rawPassword);
    this.passwordChangeRequired = false;
  }

  setRandomPassword(): string {
    const rawPassword = random_password_generate(12);
    this.password = this.encryptPassword(rawPassword);
    this.passwordChangeRequired = true;
    return rawPassword;
  }

  validatePassword(rawPassword: string): boolean {
    return !!(this.password === this.encryptPassword(rawPassword));
  }

  encryptPassword(rawPassword: string) {
    if (!this.salt) {
      this.initializeSalt();
    }
    return crypto.scryptSync(rawPassword, this.salt, 64, {N: 1024}).toString('hex');
  }
}
