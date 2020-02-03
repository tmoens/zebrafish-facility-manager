import { EntityRepository, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { classToPlain, plainToClassFromExist } from 'class-transformer';
import { Background } from './background.entity';
import { BackgroundDto } from './background.dto';

@EntityRepository(Background)
export class BackgroundRepository extends Repository<Background> {

  constructor(
  ) {
    super();
  }

  async findAll(): Promise<any> {
    const items = await super.find();
    return classToPlain(items);
  }

  async createAndSave(dto: BackgroundDto): Promise<any> {
    const o = await this.validateDTO(dto, true);
    return await this.saveOrFail(o);
  }

  async validateAndRemove(id: any): Promise<any> {
    // TODO Validation - do not delete if there are references to it
    return await super.remove( await this.findOrFail(id));
  }

  async validateAndUpdate(dto: BackgroundDto): Promise<any> {
    const o = await this.validateDTO(dto, false);
    return await this.saveOrFail(o);
  }

  // TODO Should this not be class to plain?
  async findByName(name: string): Promise<Background> {
    return await this.findOne({ where: {name}});
  }

  async validateDTO(dto: BackgroundDto, forCreation: boolean): Promise<Background> {
    let candidate: Background;
    if (forCreation) {
      if (dto.id) {
        throw new BadRequestException('Bad Request', 'Cannot specify and id when creating a background');
      } else {
        candidate = new Background();
      }
    } else {
      candidate = await this.findOrFail(dto.id);
    }

    // NOTE: this call merges the dto into the candidate.
    candidate = plainToClassFromExist(candidate, dto);

    return candidate;
  }

  async findOrFail(id: number): Promise<Background> {
    const o: Background = await this.findOne(id);
    if (o) {
      return o;
    } else {
      throw new BadRequestException('Bad Request', 'Object does not exist. id: ' + id);
    }
  }

  async saveOrFail(o: Background): Promise<any> {
    return classToPlain(await this.save(o)
      .catch(error => {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException('Bad Request', 'Background name "' + o.name + '" already exists.');
        } else {
          throw new BadRequestException('Bad Request', 'error.message');
        }
      }));
  }
}
