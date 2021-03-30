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
import {Transgene} from './transgene.entity';
import {TransgeneService} from './transgene.service';
import {plainToClass} from 'class-transformer';
import {TransgeneFilter} from './transgene.filter';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {Role} from '../guards/role.decorator';
import {USER_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {ImportResponse} from '../common/import-response';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('transgene')
export class TransgeneController {
  constructor(
    private readonly transgeneService: TransgeneService,
  ) {
  }

  @Get()
  async findFiltered(@Query() params): Promise<Transgene[]> {
    const filter: TransgeneFilter = plainToClass(TransgeneFilter, params);
    return await this.transgeneService.findFiltered(filter);
  }

  @Get('autoCompleteOptions')
  async  getAutoCompleteOptions(): Promise<any> {
    return await this.transgeneService.getAutoCompleteOptions();
  }

  @Get('nextName')
  async nextName(): Promise<{ name: string }> {
    return await this.transgeneService.getNextName();
  }

  @Get(':id')
  async findById(@Param('id', new ParseIntPipe())  id: number): Promise<Transgene> {
    return await this.transgeneService.findById(id);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('import')
  async import(@Body() newObj: Transgene): Promise<ImportResponse<Transgene>> {
    return await this.transgeneService.import(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() newObj: any): Promise<Transgene> {
    return await this.transgeneService.validateAndCreate(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('next')
  async createNext(@Body() newObj: any): Promise<Transgene> {
    return await this.transgeneService.validateAndCreateOwned(newObj);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Put()
  async update(@Body() dto: any): Promise<Transgene> {
    return await this.transgeneService.validateAndUpdate(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Delete(':id')
  async delete(@Param() params): Promise<Transgene> {
    return await this.transgeneService.validateAndRemove(params.id);
  }
}
