import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user.entity';
import {UserRepository} from './user.repository';
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule} from "../config/config.module";
import {ConfigService} from "../config/config.service";
import {ZFMailerService} from "../mailer/mailer-service";
import {StockRepository} from '../stock/stock.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository, StockRepository]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {expiresIn: configService.jwtDuration},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, ZFMailerService],
  exports: [
    TypeOrmModule,
    UserService,
  ],
})
export class UserModule {}
