import {ZfinConstructDto} from './zfin-construct.dto';

export class ZfinTransgeneDto {
  aminoAcidsRemoved: string;
  dnaExon: string;
  dnaIntron: string;
  featureId: string;
  featureZygosity: string;
  mutagee: string;
  mutagen: string;
  name: string;
  primaryIdentifier: string;
  proteinEnd: string;
  proteinStart: string;
  symbol: string;
  constructs: ZfinConstructDto[];
}
