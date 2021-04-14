import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TankController } from './tank.controller';
import { TankService } from './tank.service';
import { Tank } from './tank.entity';
import { TankRepository } from './tank.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tank, TankRepository]),
  ],
  providers: [
    TankService,
  ],
  controllers: [
    TankController,
  ],
  exports: [
    TankService,
  ],

})

export class TankModule {}
