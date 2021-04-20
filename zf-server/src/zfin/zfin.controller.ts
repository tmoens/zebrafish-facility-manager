import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZfinService } from './zfin.service';

@Controller('zfin')
export class ZfinController {
  constructor(private readonly zfinService: ZfinService) {}

}
