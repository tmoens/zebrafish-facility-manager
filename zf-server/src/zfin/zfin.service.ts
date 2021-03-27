import { Injectable } from '@nestjs/common';
import { ZfinMutationEntity, ZfinMutationSearchFilter, ZfinMutationSearchResult } from './entities/zfin-mutation.entity';
import { ZfinSearchConfidence } from './entities/zfin.entity';
import { ZfinTransgeneEntity, ZfinTransgeneSearchFilter, ZfinTransgeneSearchResult } from './entities/zfin-transgene.entity';
import {Mutation} from '../mutation/mutation.entity';
import {Transgene} from '../transgene/transgene.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const intermine = require('imjs');

@Injectable()
export class ZfinService {
  mine: any;

  constructor() {
    this.mine = new intermine.Service({
      root: 'http://www.zebrafishmine.org//service/',
    });
  }

  findAll() {
    return `This action returns all zfin`;
  }

  async findFilteredMutations(filter: ZfinMutationSearchFilter): Promise<ZfinMutationSearchResult> {
    const alleleToken: string = this.stripSpace(filter.alleleToken);
    const geneToken: string = this.stripSpace(filter.geneToken);


    // Case: We are given both a gene name and an allele name
    // Here we have to do a little guessing.
    // Allele names are universally unique so a search on allele names should suffice.
    // But someone may have given us a valid allele name and an incorrect
    // (read incomplete, alternate, partial) gene name.
    // Soooo, we are basically just going to ignore the gene Token.
    if (alleleToken && geneToken) {
      return await this.findMutationsByName(alleleToken);
    }

    // Case: We are given an allele name only
    if (alleleToken) {
      return await this.findMutationsByName(alleleToken);
    }

    // Case: we are looking for mutations on a given gene,
    if (geneToken) {
      return await this.findMutationsForGene(geneToken);
    }

    // Case: We are just given an arbitrary search token and dont know if it is for
    // and allele or a gene.
    // Note: We only look at the "arbitraryToken" if there is no gene or allele token
    if (filter.arbitraryToken) {
      const searchToken = this.stripSpace(filter.arbitraryToken);
      let r: ZfinMutationSearchResult;

      // First best guess: The arbitraryToken is an allele name (or part of one)
      r = await this.findMutationsByName(searchToken);
      r.exactMatchIndex = -1;

      // Background: for a given gene (say xyzzy) ZFIN seems often to have
      // a "placeholder" allele like this: xyzzy_unspecified or like this:
      // xyzzy_unrecovered, neither of which follow the naming conventions
      // of alleles. Worse yet, it creates a serious overlap between gene
      // names and allele names.
      // Problem: when we get an arbitraryToken, we do not know if it is for a gene
      // or an allele.  So we look first for an allele that matches the token
      // and failing that, for a gene that matches the token.
      // Say the caller sends us arbitraryToken xyzzy intending to get all the
      // alleles for that gene.  Unfortunately we find an allele xyzzy_unspecified
      // and think we are done.
      // Solution, when we search on the allele, we filter out any responses
      // that include the string "unspecified".
      r.zfinMutations = r.zfinMutations.filter((m) => {
        if (m.name.indexOf('unspecified') === -1 && m.name.indexOf('unrecovered') === -1) return m;
      });

      // If, after filtering there are no mutations, we devolve to
      // Second best guess: the arbitrary token is for a gene name:
      if (r.zfinMutations.length === 0) {
        r = await this.findMutationsForGene(searchToken);
        r.exactMatchIndex = -1;
      }
      return r;
    }

    // No search filter given
    if (!alleleToken && !geneToken && !filter.arbitraryToken) {
      const r: ZfinMutationSearchResult = new ZfinMutationSearchResult();
      r.message = 'No search filter provided';
      r.searchConfidence = ZfinSearchConfidence.BAD_TOKEN;
      return r;
    }
  }

  /**
   * Go ask the ZFIN database if it knows a mutation, searching by allele name
   * @param alleleName
   */
  async findMutationsByName(alleleName: string): Promise<ZfinMutationSearchResult> {
    const r = new ZfinMutationSearchResult();
    r.alleleTokenUsed = alleleName;

    const where: Record<string, string>[] = [{ path: 'name', op: 'LIKE', value: alleleName, code: 'A' }];

    r.zfinMutations = await this.queryMutation(where);
    r.zfinMutations.map((m, index) => {
      if (m.name === alleleName) r.exactMatchIndex = index;
    });
    return r;
  }

  // no wildcards
  async findExactMutationByName(alleleName: string): Promise<ZfinMutationEntity> {
    const where: Record<string, string>[] =
      [{ path: 'name', op: '=', value: alleleName, code: 'A' }];
    const list: ZfinMutationEntity[] = await this.queryMutation(where);
    if (list.length === 1) {
      return list[0];
    }
    else return null;
  }

  // no wild cards but we cut the client a bit of slack because they are often
  // not used to supplying the Tg or Gt at the end of their allele name for transgenes
  async findExactTransgeneByName(alleleName: string): Promise<ZfinTransgeneEntity> {
    let where = [{ path: 'name', op: '=', value: alleleName, code: 'A' }];
    let list: ZfinTransgeneEntity[] = await this.queryTransgene(where);
    if (list.length === 1) {
      return list[0];
    }
    where = [{ path: 'name', op: '=', value: alleleName + 'Tg', code: 'A' }];
    list = await this.queryTransgene(where);
    if (list.length === 1) {
      return list[0];
    }
    where = [{ path: 'name', op: '=', value: alleleName + 'Gt', code: 'A' }];
    list = await this.queryTransgene(where);
    if (list.length === 1) {
      return list[0];
    }
    return null;
  }


  async findMutationsForGene(geneName: string): Promise<ZfinMutationSearchResult> {
    const r = new ZfinMutationSearchResult();
    r.geneTokenUsed = geneName;

    const where: Record<string, string>[] = [{ path: 'genes.symbol', op: 'LIKE', value: geneName, code: 'A' }];

    r.zfinMutations = await this.queryMutation(where);
    r.zfinMutations.map((m, index) => {
      if (m.genes[0].symbol === geneName) r.exactMatchIndex = index;
    });
    return r;
  }

  async findMutationsByNameForGene(alleleName: string, geneName: string): Promise<ZfinMutationSearchResult> {
    const r = new ZfinMutationSearchResult();
    r.alleleTokenUsed = alleleName;
    r.geneTokenUsed = geneName;

    const where: Record<string, string>[] = [
      { path: 'name', op: 'LIKE', value: alleleName, code: 'A' },
      { path: 'genes.symbol', op: 'LIKE', value: geneName, code: 'B' },
    ];

    r.zfinMutations = await this.queryMutation(where, 'A and B');
    r.zfinMutations.map((m, index) => {
      if (m.name === alleleName && m.genes[0].symbol === geneName) {
        r.exactMatchIndex = index;
      }
    });
    return r;
  }

  async queryMutation(where: Record<string, string>[], constraintLogic: string = null): Promise<ZfinMutationEntity[]> {
    const query = {
      constraintLogic: constraintLogic,
      from: 'SequenceAlteration',
      select: ZfinMutationEntity.getSelectFields(),
      where: where,
      joins: ['genes'],
      orderBy: [
        {
          path: 'symbol',
          direction: 'DESC',
        },
      ],
    };
    console.log(`Mutation: ${JSON.stringify(where)}`);
    const records: ZfinMutationEntity[] = await this.mine.records(query);

    // For some reason, the query to ZFIN for SequenceAlteration returns some transgenes
    // so we are going to get rid of them.
    return records.filter((r: ZfinMutationEntity) => !r.name.endsWith('Tg'));
  }

  stripSpace(s: string): string {
    if (!s) return '';
    return s.replace(/\s/g, '');
  }

  async findFilteredTransgenes(filter: ZfinTransgeneSearchFilter): Promise<ZfinTransgeneSearchResult> {
    const nameToken: string = this.stripSpace(filter.nameToken);
    const constructToken: string = this.stripSpace(filter.constructToken);

    // Case: We are given both a construct name and a transgene name
    if (nameToken && constructToken) {
      return await this.findTransgenesByNameForConstruct(nameToken, constructToken);
    }

    // Case: We are given a transgene name only
    if (nameToken) {
      return await this.findTransgeneByName(nameToken);
    }

    // Case: we are looking for transgenes on a given gene
    if (constructToken) {
      return await this.findTransgenesForConstruct(constructToken);
    }

    // Case: We are just given an arbitrary search token and dont know if it is for
    // and allele or a gene.
    // Note: We only look at the "arbitraryToken" if there is no gene or allele token
    if (filter.arbitraryToken) {
      const searchToken = this.stripSpace(filter.arbitraryToken);
      let r: ZfinTransgeneSearchResult;

      // First best guess: The arbitraryToken is an allele name
      // But wait if the token does not end in Tg, tack one on for free
      let suffix = '';
      if (!searchToken.endsWith('tg')) suffix = 'tg';
      r = await this.findTransgeneByName(searchToken + suffix);
      r.exactMatchIndex = -1;

      // If, after filtering there are no transgenes, we devolve to
      // Second best guess: the arbitrary token is for a construct name:
      if (r.zfinTransgenes.length === 0) {
        r = await this.findTransgenesForConstruct(searchToken);
        r.exactMatchIndex = -1;
      }
      return r;
    }

    // No search filter given
    if (!nameToken && !constructToken && !filter.arbitraryToken) {
      const r: ZfinTransgeneSearchResult = new ZfinTransgeneSearchResult();
      r.message = 'No search filter provided';
      r.searchConfidence = ZfinSearchConfidence.BAD_TOKEN;
      return r;
    }
  }

  async findTransgeneByName(name: string): Promise<ZfinTransgeneSearchResult> {
    const r = new ZfinTransgeneSearchResult();
    r.nameTokenUsed = name;

    const where: Record<string, string>[] = [{ path: 'name', op: 'LIKE', value: name, code: 'A' }];

    r.zfinTransgenes = await this.queryTransgene(where);
    r.zfinTransgenes.map((m, index) => {
      if (m.name === name) r.exactMatchIndex = index;
    });
    return r;
  }

  async findTransgenesByNameForConstruct(name: string, constructName: string): Promise<ZfinTransgeneSearchResult> {
    const r = new ZfinTransgeneSearchResult();
    r.nameTokenUsed = name;
    r.constructTokenUsed = constructName;

    const where: Record<string, string>[] = [
      { path: 'name', op: 'LIKE', value: name, code: 'A' },
      {
        path: 'constructs.symbol',
        op: 'LIKE',
        value: constructName,
        code: 'B',
      },
    ];

    r.zfinTransgenes = await this.queryTransgene(where, 'A and B');
    r.zfinTransgenes.map((m, index) => {
      if (m.name === name && m.constructs[0].symbol === constructName) {
        r.exactMatchIndex = index;
      }
    });
    return r;
  }

  async findTransgenesForConstruct(constructName: string): Promise<ZfinTransgeneSearchResult> {
    const r = new ZfinTransgeneSearchResult();
    r.constructTokenUsed = constructName;

    const where: Record<string, string>[] = [
      {
        path: 'constructs.symbol',
        op: 'CONTAINS',
        value: constructName,
        code: 'B',
      },
    ];

    r.zfinTransgenes = await this.queryTransgene(where);
    r.zfinTransgenes.map((m, index) => {
      if (m.constructs[0].symbol === constructName) {
        r.exactMatchIndex = index;
      }
    });
    return r;
  }

  async queryTransgene(where, constraintLogic: string = null): Promise<ZfinTransgeneEntity[]> {
    const query = {
      constraintLogic: constraintLogic,
      from: 'TransgenicInsertion',
      select: ZfinTransgeneEntity.getSelectFields(),
      joins: ['constructs'],
      where: where,
      orderBy: [
        {
          path: 'symbol',
          direction: 'DESC',
        },
      ],
    };
    console.log(`Tansgene: ${JSON.stringify(where)}`);
    const records = await this.mine.records(query);
    console.log('Number of matches: ' + records.length);
    return records;
  }

  findOne(id: number) {
    return `This action returns a #${id} zfin`;
  }

  async updateMutationUsingZfin(m: Mutation): Promise<Mutation> {
    // can't do anything if the mutation does not have an allele name
    if (!m.name) return m;

    // See if we can dig up a zfin record for the allele name.
    const zm: ZfinMutationEntity = await this.findExactMutationByName(m.name);

    // if not, we are done
    if (!zm) return m;

    // Gene names change.  Fact of life. This is how we deal with it.
    if (zm.genes.length === 1 && m.gene !== zm.genes[0].symbol) {
      // The mutation has a gene name AND the one in ZFIN is different!
      // Add the current gene name to the alternate gene names for the mutation
      if (m.alternateGeneName) {
        m.alternateGeneName = m.alternateGeneName + ` ${m.gene}`;
      } else {
        m.alternateGeneName = m.gene;
      }
      // If there is not already a nickname, use the current gene name as the nickname
      if (!m.nickname) m.nickname = `${m.gene}^${m.name}`;

      // Use the zfin gene name as the mutation's gene name
      m.gene = zm.genes[0].symbol;
    }
    if (zm.featureId) {
      m.zfinId = zm.featureId;
    }
    m.screenType = zm.mutagen;
    // Notes about mutation type.  In ZFIN you can get the mutation type by joining
    // the sequenceOntologyTerm.name and .identifier and mapping the from the
    // very large set of values there to the few we use here.
    // But there are thousands of such terms in ZFIN and I cannot even find
    // several of the ones we use.
    // e.g ZFIN sequenceOntologyTerm for "point_mutaion" has id: SO:1000008
    // insertion SO:0000667
    // gene trap SO:0001447
    // enhancer trap SO:0001479
    // deletion SO:0001415
    // missense: ???
    // nonsense: ???
    // InDel: ???
    // targeted: ???
    // random ins: ???
    // So the mapping is not complete in either direction and I'll leave
    // this for a rainy day.

    // mapping for nucleotide change is easier but I'm still not going to do it.
    // To get it from ZFIN, you need to include joins: ["dnaMutation"] and then map
    // from ZFIN values to stings we might use
    // e.g. ZFIN A_toG_transition (Id: SO1000015) to our A>G
    // Strangely ZFIN only has A>G, C>T, G>A and T>C  so again - the mapping
    // will be incomplete either way and I am not going to do it.
    return m;
  }

  async updateTransgeneUsingZfin(t: Transgene): Promise<Transgene> {
    // can't do anything if the transgene does not have an allele name
    if (!t.allele) return t;

    // See if we can dig up a zfin record for the allele name.
    let zt: ZfinTransgeneEntity = await this.findExactTransgeneByName(t.allele);

    // the user may have forgotten to add a Tg or a Gt
    if (!zt) {
      return t;
    }

    // In case the allele provided was missing a suffix, use the
    // allele name we got back from zfin;
    t.allele = zt.symbol;

    // Construct names change.  Fact of life. This is how we deal with it.
    if (zt.constructs.length === 1 && t.descriptor !== zt.constructs[0].symbol) {
      // The transgene has a construct AND the one in ZFIN is different!
      // If there is not already a nickname, use the current construct name
      // as the nickname
      if (!t.nickname) t.nickname = `${t.descriptor}^${t.allele}`;

      // Use the zfin construct name as the transgene's construct name
      t.descriptor = zt.constructs[0].symbol;
    }
    if (zt.featureId) {
      t.zfinId = zt.featureId;
    }
    return t;
  }
}
