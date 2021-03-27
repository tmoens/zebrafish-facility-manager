import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MutationService } from './mutation.service';
import { MutationController } from './mutation.controller';
import { Mutation } from './mutation.entity';
import { MutationRepository } from './mutation.repository';
import { TransgeneRepository } from '../transgene/transgene.repository';
import {ZfinModule} from '../zfin/zfin.module';
import {TransgeneModule} from '../transgene/transgene.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mutation, MutationRepository, TransgeneRepository]),
    ZfinModule,
    forwardRef(() => TransgeneModule),
  ],
  providers: [
    MutationService,
  ],
  controllers: [
    MutationController,
  ],
  exports: [
    MutationService,
  ]
})
export class MutationModule {}
