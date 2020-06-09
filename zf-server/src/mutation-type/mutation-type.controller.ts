import {ClassSerializerInterceptor, Controller, Get, UseInterceptors} from '@nestjs/common';
import {MutationType} from "./mutation-type.entity";
import {MutationTypeRepository} from "./mutation-type.repository";

@UseInterceptors(ClassSerializerInterceptor)

@Controller('mutation-type')
export class MutationTypeController {
  constructor(
    private readonly repo: MutationTypeRepository,
  ) {
  }

  @Get()
  async findAll(): Promise<MutationType[]> {
    return await this.repo.findAll();
  }
}
