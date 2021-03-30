import {BadRequestException} from '@nestjs/common';

/**
 * This is just a place to gather stuff common to all the services
 */
export class GenericService {

  // validation helpers for checking inbound request DTOs
  mustHaveAttribute(dto: any, attribute: string) {
    if (!dto[attribute]) {
      const msg = '9706311 Cannot create without attribute: ' + attribute + '.';
      throw new BadRequestException(msg);
    }
  }

  ignoreAttribute(dto: any, attribute: string) {
    if (dto[attribute]) {
      delete dto[attribute];
    }
  }
}
