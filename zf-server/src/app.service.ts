import { Injectable } from '@nestjs/common';
import {ConfigService} from "./config/config.service";

@Injectable()
export class AppService {
  constructor(configService: ConfigService) {
    console.log('config: ' + JSON.stringify(configService));
  }
}
