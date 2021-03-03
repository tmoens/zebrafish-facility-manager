import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {ConfigService} from './config/config.service';
import {ClientConfig} from './common/config/client-config';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) {}

  @Get('clientConfig')
  getClientConfig(): ClientConfig {
    return this.configService.clientConfig;
  }
}
