import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [
    TypeOrmModule,
    UserService,
  ],
})
export class UserModule {}
