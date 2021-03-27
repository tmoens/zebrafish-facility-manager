import { Module } from '@nestjs/common';
import { ZfinService } from './zfin.service';
import { ZfinController } from './zfin.controller';

@Module({
  controllers: [ZfinController],
  providers: [ZfinService],
  exports: [ZfinService],
})
export class ZfinModule {}
