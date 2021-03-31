import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '../config/config.service';
import {MutationRepository} from './mutation.repository';
import {TransgeneRepository} from '../transgene/transgene.repository';
import {Mutation} from './mutation.entity';
import {plainToClassFromExist} from 'class-transformer';
import {MutationFilter} from './mutation.filter';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {AutoCompleteOptions} from '../helpers/autoCompleteOptions';
import {ZfinService} from '../zfin/zfin.service';


@Injectable()
export class MutationService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectRepository(MutationRepository) private readonly repo: MutationRepository,
    @InjectRepository(TransgeneRepository) private readonly tgRepo: TransgeneRepository,
    private readonly zfinService: ZfinService,
  ) {
    super(logger);
  }

  // The next "owned" serial number comes from the max serial number from
  // either the Mutation or Transgene table.  Poor design, but it is what it is.
  async getNextSerialNumber(): Promise<number> {
    const nextMutationNumber = await this.repo.getMaxSerialNumber();
    const nextTransgeneNumber = await this.tgRepo.getMaxSerialNumber();
    return nextMutationNumber > nextTransgeneNumber
      ? nextMutationNumber + 1
      : nextTransgeneNumber + 1;
  }

  // Function to tell find the next available name for an "owned" mutation.
  async getNextName(): Promise<any> {
    return {
      name:
        this.configService.facilityInfo.prefix +
        String(await this.getNextSerialNumber()),
    };
  }

  //====================== Create =====================
  // creating NON "owned" mutations
  async validateAndCreate(dto: any): Promise<Mutation> {
    convertEmptyStringToNull(dto);
    this.ignoreAttribute(dto, 'id');
    this.ignoreAttribute(dto, 'serialNumber');
    this.mustHaveAttribute(dto, 'name');
    // should not be named to look like an owned mutation.
    this.checkNameValidity(dto.name);
    let candidate: Mutation = new Mutation();
    candidate = plainToClassFromExist(candidate, dto);
    await this.mustNotExist(candidate.name);
    return await this.repo.save(candidate);
  }

  // for creating the next "owned" mutation, we auto-create the name
  async validateAndCreateOwned(dto: any): Promise<Mutation> {
    convertEmptyStringToNull(dto);
    this.ignoreAttribute(dto, 'id');
    dto.serialNumber = await this.getNextSerialNumber();
    // auto name "owned" mutations
    dto.name = this.configService.facilityInfo.prefix + String(dto.serialNumber);
    let candidate: Mutation = new Mutation();
    candidate = plainToClassFromExist(candidate, dto);
    await this.mustNotExist(candidate.name); // not that it can, given how we made it.
    return await this.repo.save(candidate);
  }

  // for bulk loading, when we create a mutant we can look to ZFIN for help in filling in
  // some of the fields and we may be getting some "owned" mutations with serial numbers
  async import(dto: any): Promise<Mutation> {
    convertEmptyStringToNull(dto);
    this.ignoreAttribute(dto, 'id');

    // create a mutation from the dto we received
    let candidate: Mutation = new Mutation();
    candidate = plainToClassFromExist(candidate, dto);

    // if possible, fill in some data using ZFIN
    candidate = await this.zfinService.updateMutationUsingZfin(candidate);

    await this.validateForImport(candidate);
    return this.repo.save(candidate);
  }

  // for updating, make sure the mutation is there
  async validateAndUpdate(dto: any): Promise<Mutation> {
    convertEmptyStringToNull(dto);
    this.mustHaveAttribute(dto, 'id');
    // get the mutation as it stands prior to update.
    let candidate: Mutation = await this.mustExist(dto.id);
    // You can never change a serial number for a mutation.
    this.ignoreAttribute(dto, 'serialNumber');
    if (candidate.isOwned()) {
      // you cannot rename an owned mutation
      this.ignoreAttribute(dto, 'name');
    } else {
      // you cannot rename an unowned mutation so it looks like it is owned
      if (dto.name) {
        this.checkNameValidity(dto.name);
      }
    }
    candidate = plainToClassFromExist(candidate, dto);
    return await this.repo.save(candidate);
  }


  async validateAndRemove(id: any): Promise<any> {
    const candidate: Mutation = await this.mustExist(id);
    if (!(await this.repo.isDeletable(candidate.id))) {
      this.logAndThrowException(
        '3147643 attempt to delete mutation that exists in one or more stocks.' +
        ' Mutation id: ' +
        candidate.id);
    }

    // When you use remove, TypeORM returns the object you deleted with the
    // id set to undefined.  Which makes some sense.
    // However the client wants to see the id of the deleted object, so we stuff
    // it back in.
    const deleted = await this.repo.remove(candidate);
    deleted.id = id;
    return deleted;
  }

  async mustExist(id: number): Promise<Mutation> {
    const candidate: Mutation = await this.repo.findOne(id);
    if (!candidate) {
      this.logAndThrowException('7684423 update a non-existent mutation.');
    }
    return candidate;
  }

  async mustNotExist(name: string): Promise<Boolean> {
    const m: Mutation[] = await this.repo.find({
      where: {name}
    });
    if (m.length > 0) {
      this.logAndThrowException('9893064 attempt to create a transgene with a name that already exists.');
    } else {
      return true;
    }
  }

  async validateForImport(m: Mutation): Promise<boolean> {
    if (!m.name) {
      throw new BadRequestException('Cannot create mutation without a name.');
    }

    const errors: string[] = [];
    const nameInUse = await this.nameInUse(m.name);
    if (nameInUse) errors.push(nameInUse);

    // For imports we allow serial numbers
    if (m.serialNumber) {
      let snInUse = await this.repo.serialNumberInUse(m.serialNumber);
      if (snInUse) errors.push(snInUse);
      snInUse = await this.tgRepo.serialNumberInUse(m.serialNumber);
      if (snInUse) errors.push(snInUse);
    }

    if (m.nickname) {
      const nickNameInUse = await this.nickNameInUse(m.nickname);
      if (nickNameInUse) errors.push(nickNameInUse);
    }

    if (errors.length > 0) {
      this.logAndThrowException(errors.join("; "));
    }
    return true;
  }

  async nameInUse(name: string): Promise<string> {
    const m: Mutation[] = await this.repo.find({
      where: {name}
    });
    if (m.length > 0) {
      return `Mutation name "${name}" is already in use.`;
    } else {
      return null;
    }
  }

  async nickNameInUse(nickname: string): Promise<string> {
    const m: Mutation[] = await this.repo.find({
      where: {nickname}
    });
    if (m.length > 0) {
      return `Nickname "${nickname}" is already in use for mutation ${m[0].name}`;
    } else {
      return null;
    }
  }

  // for manually assigned names, make sure the name does not conflict with
  // the "owned" names for this facility.
  checkNameValidity(name: string) {
    if (name.startsWith(this.configService.facilityInfo.prefix)) {
      this.logAndThrowException(
        'You cannot name a mutation starting with ' +
        this.configService.facilityInfo.prefix +
        '.');
    }
  }

  async findFiltered(filter: MutationFilter): Promise<Mutation[]> {
    return this.repo.findFiltered(filter);
  }

  async filterByString(filterString: string): Promise<Mutation[]> {
    return this.repo.filterByString(filterString);
  }

  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    return this.repo.getAutoCompleteOptions();
  }

  // Kludge alert. When the client asks for a mutation by Id, I do an bit of
  // groundwork for the client to figure out if that mutation is deletable or not.
  // This makes it easy for the client to enable or disable a deletion operation
  // in the GUI without having to make a second call to figure out if the mutation
  // is deletable.  The cost is that I have a field called isDeletable stuffed
  // in to the mutation which a) is not populated correctly for any other request
  // and b) is calculated by the repo and not by the mutation itself (because
  // the mutation class does not have access to the repo to make the required query)
  // So it is all very ugly.
  async findById(id: number): Promise<Mutation> {
    const m: Mutation = await this.repo.findById(id);
    if (m) m.isDeletable = await this.repo.isDeletable(id);
    return m;
  }

  async findByName(name: string): Promise<Mutation> {
    return await this.repo.findByName(name);
  }
}
