import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalStrategy} from "../guards/local.strategy";
import {AuthController} from "./auth.controller";
import {ConfigService} from "../config/config.service";
import {ConfigModule} from "../config/config.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";


@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtDuration },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule {}
