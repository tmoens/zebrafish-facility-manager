import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TankService } from './tank.service';
import { TankRepository } from './tank.repository';
import { Tank } from './tank.entity';
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {Role} from '../guards/role.decorator';
import {ADMIN_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {TankDto} from '../common/tank.dto';
import {TankNeighborsDto} from '../common/tankNeighborsDto';

@UseGuards(JwtAuthGuard)
@Controller('tank')
export class TankController {
  constructor(
    private readonly service: TankService,
    @InjectRepository(TankRepository)
    private readonly repo: TankRepository,
  ) {}

  // TODO use the service, not the repo
  @Get()
  async findFiltered(@Query() params): Promise<Tank[]> {
    return await this.repo.findFiltered(params);
  }

  @Get('name/:name')
  async getByName(@Param() params): Promise<TankDto> {
    return this.service.findTankByName(params.name);
  }

  @Get('getNeighbors/:sortOrder')
  async getNeighbors(@Param() params): Promise<TankNeighborsDto> {
    return this.service.getNeighbors(params.sortOrder);
  }

  @Get('getFirst')
  async getfirst(): Promise<TankDto> {
    return this.service.findTankAfter('');
  }

  // TODO get the next free tanks (after a given tank name or partial name)

  // TODO use the service, not the repo
  @Get('auditReport')
  async getReport(): Promise<any[]> {
    return await this.repo.getAuditReport();
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('import')
  async import(@Body() dto: TankDto): Promise<Tank> {
    return this.service.import(dto);
  }

  // For now, there are no CRUD operations for tanks.
  // Add new tanks using "import" or direct database access.
  // Remove or update them with direct database access.
}
