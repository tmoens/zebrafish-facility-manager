import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from './config/config.module';
import {ConfigService} from './config/config.service';
import {MutationModule} from './mutation/mutation.module';
import {TankModule} from './tank/tank.module';
import {TransgeneModule} from './transgene/transgene.module';
import {Stock2tankModule} from './stock2tank/stock2tank.module';
import {StockModule} from './stock/stock.module';
import {AuthModule} from './auth/auth.module';
import * as winston from "winston";
import {utilities as nestWinstonModuleUtilities, WinstonModule} from 'nest-winston';
import * as DailyRotateFile from "winston-daily-rotate-file";
import {UserModule} from "./user/user.module";
import {LoggerMiddleware} from "./guards/logger.middleware";
import {StockController} from "./stock/stock.controller";
import {AuthController} from "./auth/auth.controller";
import {MutationController} from "./mutation/mutation.controller";
import {TransgeneController} from "./transgene/transgene.controller";
import {UserController} from "./user/user.controller";
import {LocalStrategy} from "./guards/local.strategy";
import {JwtStrategy} from "./guards/jwt.strategy";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy2} from "./guards/jwt.strategy2";
import {MailerModule} from "@nestjs-modules/mailer";
import {ZFMailerService} from "./mailer/mailer-service";


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
    ConfigModule,
    MutationModule,
    StockModule,
    Stock2tankModule,
    TankModule,
    TransgeneModule,
    UserModule,
    PassportModule,
    TypeOrmModule.forRootAsync(
      {
        imports: [ConfigModule],
        useExisting: ConfigService,
      }),
    MailerModule.forRootAsync(
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
  providers: [
    AppService,
    LocalStrategy,
    JwtStrategy,
    JwtStrategy2,
    ZFMailerService,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(StockController, AuthController, MutationController, TransgeneController, UserController);
  }
}
