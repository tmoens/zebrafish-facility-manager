import {Module} from '@nestjs/common';
import {MutationTypeController} from './mutation-type.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MutationType} from "./mutation-type.entity";
import {MutationTypeRepository} from "./mutation-type.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([MutationType, MutationTypeRepository]),
  ],
  controllers: [
    MutationTypeController
  ],
})
export class MutationTypeModule {
}
