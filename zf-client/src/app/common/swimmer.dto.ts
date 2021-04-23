import {TankDto} from './tank.dto';

// This is a minimal record of a particular stock in a particular tank.
// In theory the TankDto part should not be there, but it would be a royal pain
// to remove it now.
export class SwimmerDto {
  stockId?: number;
  tankId?: number;
  number?: number;
  comment?: number;
  tank?: TankDto;
}
