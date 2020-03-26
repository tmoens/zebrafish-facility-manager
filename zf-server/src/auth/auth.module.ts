import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalStrategy} from "./local.strategy";
import {AuthController} from "./auth.controller";
import {ConfigService} from "../config/config.service";
import {ConfigModule} from "../config/config.module";
import {PassportModule} from "@nestjs/passport";
import {UserModule} from "../user/user.module";
import {JwtModule} from "@nestjs/jwt";
import {AuthMiddleware} from "./auth.middleware";


@Module({
  imports: [
    ConfigModule,
    UserModule,
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
    LocalStrategy,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {path: 'auth/login', method: RequestMethod.POST},
        {path: 'auth/logout/:id', method: RequestMethod.POST},
      )
      .forRoutes(AuthController)
  }
}
