import {Body, Controller, Get, Post, Query, UseGuards} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TankService } from './tank.service';
import { TankRepository } from './tank.repository';
import { Tank } from './tank.entity';
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {Role} from '../guards/role.decorator';
import {ADMIN_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {TankDto} from './tank.dto';

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
  // The only way to get more is to "import"  them and the
  // only way to remove them is with a direct database query.
}
