import { ZfinGene } from './zfin-gene.entity';
import { Zfin, ZfinSearchResult } from './zfin.entity';

export class ZfinMutationEntity extends Zfin {
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
  genes: ZfinGene[] = [];

  static getSelectFields(): string[] {
    const fields: string[] = [
      'primaryIdentifier',
      'name',
      'mutagen',
      'proteinAccessionNumber',
      'aminoAcidsAdded',
      'aminoAcidsRemoved',
      'dnaBpMinus',
      'dnaExon',
      'featureId',
      'proteinEnd',
      'proteinStart',
      'dnaBpPlus',
      'dnaIntron',
      'dnaPositionEnd',
      'dnaPositionStart',
      'dnaSequenceOfReference',
      'featureZygosity',
      'mutagee',
      'symbol',
    ];
    ZfinGene.selectFields.map((fieldName: string) =>
      fields.push('genes.' + fieldName),
    );
    return fields;
  }
}

export class ZfinMutationSearchFilter{
  // we are looking for a specific allele
  alleleToken?: string;
  // we are looking for mutations on a specific gene
  geneToken?: string;
  // if neither of the specific tokens are set, we go fishing.
  arbitraryToken?: string;
}

export class ZfinMutationSearchResult extends ZfinSearchResult {
  geneTokenUsed: string;
  alleleTokenUsed: string;
  exactMatchIndex = -1;
  zfinMutations: ZfinMutationEntity[] = [];
}

