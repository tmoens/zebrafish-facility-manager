import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { TransgeneRepository } from './transgene.repository';
import { MutationRepository } from '../mutation/mutation.repository';
import { Transgene } from './transgene.entity';
import { plainToClassFromExist } from 'class-transformer';
import { TransgeneFilter } from './transgene.filter';
import {GenericService} from '../Generics/generic-service';
import {Logger} from "winston";

@Injectable()
export class TransgeneService extends GenericService{
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectRepository(TransgeneRepository) private readonly repo: TransgeneRepository,
    @InjectRepository(MutationRepository) private readonly mutationRepo: MutationRepository,
  ) {
    super();
  }

  // The next "owned" serial number comes from the max serial number from
  // either the Mutation or Transgene table.  Poor design, but it is what it is.
  async getNextSerialNumber(): Promise<number> {
    const nextMutationNumber = await this.mutationRepo.getMaxSerialNumber();
    const nextTransgeneNumber = await this.repo.getMaxSerialNumber();
    return nextMutationNumber > nextTransgeneNumber
      ? nextMutationNumber
      : nextTransgeneNumber;
  }

  // Function to tell find the next available name for an "owned" transgene.
  async getNextName(): Promise<{ name: string }> {
    return {
      name:
        this.configService.facilityInfo.prefix +
        String(await this.getNextSerialNumber()),
    };
  }

  // creating NON "owned" transgenes
  async validateAndCreate(dto: any): Promise<Transgene> {
    this.ignoreAttribute(dto, 'id');
    this.ignoreAttribute(dto, 'serialNumber');
    this.mustHaveAttribute(dto, 'allele');
    this.mustHaveAttribute(dto, 'descriptor');
    // should not be named to look like an owned transgene.
    this.checkAlleleValidity(dto.allele);
    let candidate: Transgene = new Transgene();
    candidate = plainToClassFromExist(candidate, dto);
    await this.mustNotExist(candidate.allele, candidate.descriptor);
    return await this.repo.save(candidate);
  }

  // for creating the next "owned" transgene, we auto-create the name
  async validateAndCreateOwned(dto: any): Promise<Transgene> {
    this.mustHaveAttribute(dto, 'descriptor');
    dto.serialNumber = await this.getNextSerialNumber();
    // auto name the allele for "owned" transgenes
    dto.allele =
      this.configService.facilityInfo.prefix + String(dto.serialNumber);
    let candidate: Transgene = new Transgene();
    candidate = plainToClassFromExist(candidate, dto);
    return await this.repo.save(candidate);
  }

  // for updating, make sure the tg is there
  async validateAndUpdate(dto: any): Promise<Transgene> {
    this.mustHaveAttribute(dto, 'id');
    // get the transgene as it stands prior to update.
    let candidate: Transgene = await this.mustExist(dto.id);
    // You can never change a serial number for a transgene.
    this.ignoreAttribute(dto, 'serialNumber');
    if (candidate.isOwned()) {
      // you cannot rename an owned transgene
      this.ignoreAttribute(dto, 'allele');
    } else {
      // you cannot rename an unowned transgene so it looks like it is owned
      if (dto.allele) {
        this.checkAlleleValidity(dto.allele);
      }
    }
    candidate = plainToClassFromExist(candidate, dto);
    return await this.repo.save(candidate);
  }

  async validateAndRemove(id: any): Promise<any> {
    const candidate: Transgene = await this.mustExist(id);
    if (!(await this.repo.isDeletable(candidate.id))) {
      const msg =
        '3147643 attempt to delete transgene that exists in one or more stocks.' +
        ' Transgene id: ' +
        candidate.id;
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }

    // When you use remove, TypeORM returns the object you deleted with the
    // id set to undefined.  Which makes some sense.
    // However the client wants to see the id of the deleted object, so we stuff
    // it back in.
    const deleted = await this.repo.remove(candidate);
    deleted.id = id;
    return deleted;
  }

  async mustExist(id: number): Promise<Transgene> {
    const candidate: Transgene = await this.repo.findOne(id);
    if (!candidate) {
      const msg = '7684423 update a non-existent mutation.';
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
    return candidate;
  }

  async mustNotExist(allele: string, descriptor: string): Promise<Boolean> {
    const t: Transgene[] = await this.repo.find({
      where: {allele, descriptor}
    });
    if (t.length > 0) {
      const msg = '9893064 attempt to create a transgene with a name that already exists.';
      this.logger.error(msg);
      throw new BadRequestException('Bad Request', msg);
    }
    return true;
  }

  // for manually assigned alleles, make sure the name does not conflict with
  // the "owned" allele names for this facility.
  checkAlleleValidity(allele: string) {
    if (allele.startsWith(this.configService.facilityInfo.prefix)) {
      const msg =
        'You cannot name a transgene allele starting with ' +
        this.configService.facilityInfo.prefix +
        '.';
      throw new BadRequestException('Bad Request', msg);
    }
  }

  async findFiltered(filter: TransgeneFilter): Promise<Transgene[]> {
    return this.repo.findFiltered(filter);
  }

  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    return this.repo.getAutoCompleteOptions();
  }

  // Kludge alert. When the client asks for a transgene by Id, I do an bit of
  // groundwork for the client to figure out if that transgene is deletable or not.
  // This makes it easy for the client to enable or disable a deletion operation
  // in the GUI without having to make a second call to figure out if the transgene
  // is deletable.  The cost is that I have a field called isDeletable stuffed
  // in to the transgene which a) is not populated correctly for any other request
  // and b) is calculated by the repo and not by the transgene itself (because
  // the transgene class does not have access to the repo to make the required query)
  // So it is all very ugly.
  async findById(id: number): Promise<Transgene> {
    const m: Transgene = await this.repo.findById(id);
    m.isDeletable = await this.repo.isDeletable(id);
    return m;
  }

  async findByName(name: string): Promise<Transgene> {
    return await this.repo.findByName(name);
  }

}
