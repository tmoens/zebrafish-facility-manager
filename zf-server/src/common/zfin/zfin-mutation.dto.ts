import {ZfinGeneDto} from './zfin-gene.dto';

export class ZfinMutationDto {
  primaryIdentifier: string;
  name: string;
  mutagen: string;
  proteinAccessionNumber: string;
  aminoAcidsAdded: string;
  aminoAcidsRemoved: string;
  dnaBpMinus: string;
  dnaExon: string;
  featureId: string;
  proteinEnd: string;
  proteinStart: string;
  dnaBpPlus: string;
  dnaIntron: string;
  dnaPositionEnd: string;
  dnaPositionStart: string;
  dnaSequenceOfReference: string;
  featureZygosity: string;
  mutagee: string;
  symbol: string;
  genes: ZfinGeneDto[] = [];
}

