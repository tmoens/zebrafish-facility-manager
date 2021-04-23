export class TankDto {
  id: number;
  name: string;
  rack?: string;
  slot?: string;
  comment?: string;
  sortOrder: string;
  isMultiTank: boolean;
}
