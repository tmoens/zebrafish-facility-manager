import {Controller, Get} from '@nestjs/common';
import {ScreenTypeRepository} from "./screen-type.repository";
import {ScreenType} from "./screen-type.entity";

@Controller('screen-type')
export class ScreenTypeController {
  constructor(
    private readonly repo: ScreenTypeRepository,
  ) {
  }

  @Get()
  async findFiltered(): Promise<ScreenType[]> {
    return await this.repo.findAll();
  }
}
