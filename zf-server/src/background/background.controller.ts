import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BackgroundRepository } from './background.repository';
import { Background } from './background.entity';
import { BackgroundDto } from './background.dto';
import { BackgroundService } from './background.service';

@Controller('background')
export class BackgroundController {
  constructor(
    private readonly backgroundService: BackgroundService,
    @InjectRepository(BackgroundRepository)
    private readonly repo: BackgroundRepository,
  ) {}

  @Get()
  // @UseGuards(AuthGuard('bearer'))
  async findAll(): Promise<Background[]> {
    return await this.repo.findAll();
  }

  @Get(':id')
  // @UseGuards(AuthGuard('bearer'))
  async findById(@Param() params): Promise<Background> {
    return await this.repo.findOne(params.id);
  }

  @Post()
  // @UseGuards(AuthGuard('bearer'))
  async create(@Body() newObj: BackgroundDto): Promise<Background> {
    return await this.repo.createAndSave(newObj);
  }

  @Put()
  // @UseGuards(AuthGuard('bearer'))
  async update(@Body() dto: BackgroundDto): Promise<Background> {
    return await this.repo.validateAndUpdate(dto);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard('bearer'))
  async delete(@Param() params): Promise<Background> {
    return await this.repo.validateAndRemove(params.id);
  }
}
