import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundService } from './background.service';
import { BackgroundController } from './background.controller';
import { Background } from './background.entity';
import { BackgroundRepository } from './background.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Background, BackgroundRepository]),
  ],
  providers: [
    BackgroundService,
  ],
  controllers: [
    BackgroundController,
  ],
})
export class BackgroundModule {}
