import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransgeneService } from './transgene.service';
import { TransgeneController } from './transgene.controller';
import { Transgene } from './transgene.entity';
import { TransgeneRepository } from './transgene.repository';
import { MutationRepository } from '../mutation/mutation.repository';
import {ZfinModule} from '../zfin/zfin.module';
import {MutationModule} from '../mutation/mutation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transgene, TransgeneRepository, MutationRepository]),
    ZfinModule,
    forwardRef(() => MutationModule),
  ],
  providers: [
    TransgeneService,
  ],
  controllers: [
    TransgeneController,
  ],
  // experimenting with exporting the repository for use elsewhere.
  exports: [
    TypeOrmModule,
    TransgeneService,
  ],
})
export class TransgeneModule {}
