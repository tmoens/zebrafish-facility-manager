import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TankService } from './tank.service';
import { TankRepository } from './tank.repository';
import { Tank } from './tank.entity';
import {AuthGuard} from "@nestjs/passport";

@Controller('tank')
export class TankController {
  constructor(
    private readonly tankService: TankService,
    @InjectRepository(TankRepository)
    private readonly repo: TankRepository,
  ) {}

  @Get()
  async findFiltered(@Query() params): Promise<Tank[]> {
    return await this.repo.findFiltered(params);
  }

  @Get('auditReport')
  async getReport(): Promise<any[]> {
    return await this.repo.getAuditReport();
  }
}
