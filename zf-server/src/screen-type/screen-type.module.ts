import {Module} from '@nestjs/common';
import {ScreenTypeController} from './screen-type.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ScreenType} from "./screen-type.entity";
import {ScreenTypeRepository} from "./screen-type.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([ScreenType, ScreenTypeRepository]),
  ],
  controllers: [ScreenTypeController]
})
export class ScreenTypeModule {
}
