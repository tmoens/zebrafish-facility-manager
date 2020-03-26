import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from './config/config.module';
import {ConfigService} from './config/config.service';
import {MutationModule} from './mutation/mutation.module';
import {TankModule} from './tank/tank.module';
import {TransgeneModule} from './transgene/transgene.module';
import {BackgroundModule} from './background/background.module';
import {Stock2tankModule} from './stock2tank/stock2tank.module';
import {StockModule} from './stock/stock.module';
import {AuthModule} from './auth/auth.module';
import * as winston from "winston";
import {utilities as nestWinstonModuleUtilities, WinstonModule} from 'nest-winston';
import * as DailyRotateFile from "winston-daily-rotate-file";
import {UserModule} from "./user/user.module";


const rotatingFileLog = new DailyRotateFile({
  filename: 'zf-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  dirname: 'log',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});


const consoleLog = new (winston.transports.Console)({
  format: winston.format.combine(
    winston.format.timestamp(),
    nestWinstonModuleUtilities.format.nestLike(),
  ),
});

@Module({
  imports: [
    AuthModule,
    BackgroundModule,
    ConfigModule,
    MutationModule,
    StockModule,
    Stock2tankModule,
    TankModule,
    TransgeneModule,
    UserModule,
    TypeOrmModule.forRootAsync(
      {
        imports: [ConfigModule],
        useExisting: ConfigService,
      }),
    WinstonModule.forRoot({
      transports: [
        consoleLog,
        rotatingFileLog,
      ],
      // other options
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
