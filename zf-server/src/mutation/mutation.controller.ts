import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {Mutation} from './mutation.entity';
import {MutationService} from './mutation.service';
import {plainToClass} from 'class-transformer';
import {MutationFilter} from './mutation.filter';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {Role} from '../guards/role.decorator';
import {ADMIN_ROLE, USER_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('mutation')
export class MutationController {
  constructor(
    private readonly mutationService: MutationService,
  ) {
  }

  @Get()
  async findFiltered(@Query() params): Promise<Mutation[]> {
    const filter: MutationFilter = plainToClass(MutationFilter, params);
    return await this.mutationService.findFiltered(filter);
  }

  @Get('stringFiltered/:filterString')
  async filterByString(@Param('filterString')  filterString: string): Promise<Mutation[]> {
    return await this.mutationService.filterByString(filterString);
  }

  @Get('autoCompleteOptions')
  async getAutoCompleteOptions(): Promise<any> {
    return await this.mutationService.getAutoCompleteOptions();
  }

  @Get('nextName')
  async nextNumber(): Promise<any> {
    return await this.mutationService.getNextName();
  }

  @Get(':id')
  async findById(@Param('id', new ParseIntPipe())  id: number): Promise<Mutation> {
    return await this.mutationService.findById(id);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('import')
  async import(@Body() dto: Mutation): Promise<Mutation> {
    return await this.mutationService.import(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() newObj: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndCreate(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('next')
  async createNext(@Body() newObj: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndCreateOwned(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Put()
  async update(@Body() dto: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndUpdate(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(RoleGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe())  id: number): Promise<Mutation> {
    return await this.mutationService.validateAndRemove(id);
  }
}
