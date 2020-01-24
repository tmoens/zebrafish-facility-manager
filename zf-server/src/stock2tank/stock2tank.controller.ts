import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock2tankRepository } from './stock2tank.repository';
import { Stock2tank } from './stock-to-tank.entity';
import { Stock2tankService } from './stock2tank.service';
import { Stock } from '../stock/stock.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('swimmer')
export class Stock2tankController {
  constructor(
    private readonly service: Stock2tankService,
    @InjectRepository(Stock2tankRepository)
    private readonly repo: Stock2tankRepository,
  ) {}

  @Get()
  // @UseGuards(AuthGuard('bearer'))
  async findAll(): Promise<Stock2tank[]> {
    return await this.repo.findAll();
  }

  @Get(':id')
  // @UseGuards(AuthGuard('bearer'))
  async findById(@Param() params): Promise<Stock2tank> {
    return await this.repo.findOne(params.id);
  }

  @Get('tank/:id')
  async findSwimmersInTank(@Param() params): Promise<Stock2tank[]> {
    return await this.service.findSwimmersInTank(params.id);
  }

  @Post()
//  @UseGuards(AuthGuard('bearer'))
  async create(@Body() newObj: Stock2tank): Promise<any> {
    return await this.repo.createSwimmer(newObj);
  }

  @Put()
//  @UseGuards(AuthGuard('bearer'))
  async update(@Body() dto: Stock2tank): Promise<any> {
    return await this.repo.updateSwimmer(dto);
  }

  @Delete(':stockId/:tankId')
//  @UseGuards(AuthGuard('bearer'))
  async delete(@Param() params): Promise<Stock> {
    return await this.repo.removeSwimmer(params.stockId, params.tankId);
  }
}
