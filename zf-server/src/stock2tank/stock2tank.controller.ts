import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock2tankRepository } from './stock2tank.repository';
import { Stock2tank } from './stock-to-tank.entity';
import { Stock2tankService } from './stock2tank.service';
import { Stock } from '../stock/stock.entity';
import {JwtAuthGuard} from "../guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('swimmer')
export class Stock2tankController {
  constructor(
    private readonly service: Stock2tankService,
    @InjectRepository(Stock2tankRepository)
    private readonly repo: Stock2tankRepository,
  ) {}

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

  @Post()
  async create(@Body() newObj: Stock2tank): Promise<any> {
    return await this.repo.createSwimmer(newObj);
  }

  @Put()
  async update(@Body() dto: Stock2tank): Promise<any> {
    return await this.repo.updateSwimmer(dto);
  }

  @Delete(':stockId/:tankId')
  async delete(@Param() params): Promise<Stock> {
    return await this.repo.removeSwimmer(params.stockId, params.tankId);
  }
}
