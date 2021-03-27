import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZfinService } from './zfin.service';
import {ZfinMutationEntity, ZfinMutationSearchFilter, ZfinMutationSearchResult} from './entities/zfin-mutation.entity';
import { plainToClass } from 'class-transformer';
import {
  ZfinTransgeneEntity,
  ZfinTransgeneSearchFilter,
  ZfinTransgeneSearchResult
} from './entities/zfin-transgene.entity';

@Controller('zfin')
export class ZfinController {
  constructor(private readonly zfinService: ZfinService) {}

  @Get('findMutations')
  async findZfinMuations(@Query() params): Promise<ZfinMutationSearchResult> {
    const filter: ZfinMutationSearchFilter = plainToClass(ZfinMutationSearchFilter, params);
    return await this.zfinService.findFilteredMutations(filter);
  }

  @Get('findTransgenes')
  async findZfinTransgenes(@Query() params): Promise<ZfinTransgeneSearchResult> {
    const filter: ZfinTransgeneSearchFilter = plainToClass(ZfinTransgeneSearchFilter, params);
    return await this.zfinService.findFilteredTransgenes(filter);
  }

  @Get('search/:text')
  search(@Param('text') text: string) {
    return this.zfinService.findMutationsByName(text);
  }

  @Get('mutationByName/:alleleName')
  getExactMutationByName(@Param('alleleName') alleleName: string): Promise<ZfinMutationEntity> {
    return this.zfinService.findExactMutationByName(alleleName);
  }

  @Get('transgeneByName/:alleleName')
  getExactTransgeneByName(@Param('alleleName') alleleName: string): Promise<ZfinTransgeneEntity> {
    return this.zfinService.findExactTransgeneByName(alleleName);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zfinService.findOne(+id);
  }
}
