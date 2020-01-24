import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { BackgroundRepository } from './background.repository';

@Injectable()
export class BackgroundService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BackgroundRepository)
    private readonly repo: BackgroundRepository,
    ) {
  }
}
