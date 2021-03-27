import { PartialType } from '@nestjs/mapped-types';
import { CreateZfinDto } from './create-zfin.dto';

export class UpdateZfinDto extends PartialType(CreateZfinDto) {}
