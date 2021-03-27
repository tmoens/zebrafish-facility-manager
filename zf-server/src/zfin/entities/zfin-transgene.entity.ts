import { Zfin, ZfinSearchResult } from './zfin.entity';
import { ZfinConstruct } from './zfin-construct.entity';

export class ZfinTransgeneEntity extends Zfin {
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
  constructs: ZfinConstruct[];

  static getSelectFields(): string[] {
    const fields: string[] = [
      'aminoAcidsRemoved',
      'dnaExon',
      'dnaIntron',
      'featureId',
      'featureZygosity',
      'mutagee',
      'mutagen',
      'name',
      'primaryIdentifier',
      'proteinEnd',
      'proteinStart',
      'symbol',
    ];
    ZfinConstruct.selectFields.map((fieldName: string) =>
      fields.push('constructs.' + fieldName),
    );
    return fields;
  }
}

export class ZfinTransgeneSearchFilter {
  // we are looking for a specific tgName
  nameToken?: string;
  // we are looking for constructs with a specific gene
  constructToken?: string;
  // if neither of the specific tokens are set, we go fishing.
  arbitraryToken?: string;
}

export class ZfinTransgeneSearchResult extends ZfinSearchResult {
  exactMatchIndex = -1;
  nameTokenUsed = '';
  constructTokenUsed = '';
  count = 0;
  zfinTransgenes: ZfinTransgeneEntity[] = [];
}

