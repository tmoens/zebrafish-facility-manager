import {HttpService, Injectable} from '@nestjs/common';
import {Mutation} from '../mutation/mutation.entity';
import {Transgene} from '../transgene/transgene.entity';
import {ZfinTransgeneDto} from '../common/zfin/zfin-transgene.dto';
import {ZfinMutationDto} from '../common/zfin/zfin-mutation.dto';
import {ConfigService} from '../config/config.service';
import {map} from 'rxjs/operators';

@Injectable()
export class ZfinService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
  }



  /**
   * Go ask if an allele is known by ZFIN if it knows a mutation, searching by allele name
   * @param alleleName
   */
  async findMutationByName(alleleName: string): Promise<ZfinMutationDto> {
    return this.httpService.get(this.configService.zfinAlleleLookupUrl + '/mutation/allele/' + alleleName)
      .pipe(
        map(response => response.data)
      ).toPromise();

  }

  async findTransgeneByName(alleleName: string): Promise<any> {
    return this.httpService.get(this.configService.zfinAlleleLookupUrl + '/transgene/allele/' + alleleName)
      .pipe(
        map(response => response.data)
      ).toPromise();
  }

  async updateMutationUsingZfin(m: Mutation): Promise<Mutation> {
    // can't do anything if the mutation does not have an allele name
    if (!m.name) return m;

    // See if we can dig up a zfin record for the allele name.
    const zm: ZfinMutationDto = await this.findMutationByName(m.name);

    // if not, we are done
    if (!zm) return m;

    // Gene names change.  Fact of life. This is how we deal with it.
    if (m.gene !== zm.geneName) {
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
      m.gene = zm.geneName;
    }
    if (zm.zfinId) {
      m.zfinId = zm.zfinId;
    }
    return m;
  }

  async updateTransgeneUsingZfin(t: Transgene): Promise<Transgene> {
    // can't do anything if the transgene does not have an allele name
    if (!t.allele) return t;

    // See if we can dig up a zfin record for the allele name.
    let zt: ZfinTransgeneDto = await this.findTransgeneByName(t.allele);

    if (!zt) {
      return t;
    }

    // In ZFIN land, transgene construct names change.  Fact of life. This is how we deal with it.
    if (t.descriptor !== zt.zfinConstructName) {
      // The transgene has a construct AND the one in ZFIN is different!
      // If there is not already a nickname, use the current construct name
      // as the nickname
      if (!t.nickname) t.nickname = `${t.descriptor}^${t.allele}`;

      // Use the zfin construct name as the transgene's construct name
      t.descriptor = zt.zfinConstructName;
    }
    if (zt.zfinId) {
      t.zfinId = zt.zfinId;
    }
    return t;
  }
}
