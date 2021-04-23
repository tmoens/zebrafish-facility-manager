import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Stock2tankRepository} from './stock2tank.repository';
import {Stock2tank} from './stock-to-tank.entity';
import {Stock2tankService} from './stock2tank.service';
import {Stock} from '../stock/stock.entity';
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {Role} from "../guards/role.decorator";
import {USER_ROLE} from "../common/auth/zf-roles";
import {RoleGuard} from "../guards/role-guard.service";

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('swimmer')
export class Stock2tankController {
  constructor(
    private readonly service: Stock2tankService,
    @InjectRepository(Stock2tankRepository)
    private readonly repo: Stock2tankRepository,
  ) {
  }

  @Get()
  async findAll(): Promise<Stock2tank[]> {
    return await this.repo.findAll();
  }

  @Get(':id')
  async findById(@Param() params): Promise<Stock2tank> {
    return await this.repo.findOne(params.id);
  }

  @Get('tank/:id')
  async findSwimmersInTank(@Param() params): Promise<Stock2tank[]> {
    return await this.service.findSwimmersInTank(params.id);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() newObj: Stock2tank): Promise<any> {
    return await this.service.createSwimmer(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Put()
  async update(@Body() dto: Stock2tank): Promise<any> {
    return await this.repo.updateSwimmer(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Delete(':stockId/:tankId')
  async delete(@Param() params): Promise<Stock> {
    return await this.service.removeSwimmerByIds(params.stockId, params.tankId);
  }
}
