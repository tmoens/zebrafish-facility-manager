import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure, getLogger } from 'log4js';
import { mkdirSync } from 'fs';
import { ConfigService} from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(app.get('ConfigService').envConfig.PORT);

  /**
   * make several directories, just in case it is a fresh install.
   */
  try {
    mkdirSync('./log');
  } catch (e) {
    if (e.code !== 'EEXIST') {
      process.exit(1);
    }
  }

  configure('log4js_config.json');
  const logger = getLogger('main');
  logger.info('Started.  Listening on port ' + app.get('ConfigService').envConfig.PORT + '.');

}

bootstrap();
