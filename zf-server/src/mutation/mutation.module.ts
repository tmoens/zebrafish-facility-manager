import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MutationService } from './mutation.service';
import { MutationController } from './mutation.controller';
import { Mutation } from './mutation.entity';
import { MutationRepository } from './mutation.repository';
import { TransgeneRepository } from '../transgene/transgene.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mutation, MutationRepository, TransgeneRepository]),
  ],
  providers: [
    MutationService,
  ],
  controllers: [
    MutationController,
  ],
})
export class MutationModule {}
