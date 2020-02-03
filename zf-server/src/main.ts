import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from './config/config.service';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from "nest-winston";
import * as winston from "winston";
import {utilities as nestWinstonModuleUtilities} from "nest-winston/dist/winston.utilities";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        // other transports...
      ],
      // other options
    }),

  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors();

  await app.listen(app.get('ConfigService').envConfig.PORT);

}

bootstrap();
