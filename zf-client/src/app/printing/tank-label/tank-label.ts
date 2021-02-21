export enum TankLabelOption {
  TANK_NUMBER = 'TANK_NUMBER',
  STOCK_NUMBER = 'STOCK_NUMBER',
  STOCK_DESCRIPTION = 'STOCK_DESCRIPTION',
  STOCK_FERTILIZATION_DATE = 'STOCK_FERTILIZATION_DATE',
  STOCK_RESEARCHER = 'STOCK_RESEARCHER',
  STOCK_RESEARCHER_INITIALS = 'STOCK_RESEARCHER_INITIALS',
  STOCK_PI = 'STOCK_PI',
  STOCK_PI_INITIALS = 'STOCK_PI_INITIALS',
  STOCK_MUTATIONS = 'STOCK_MUTATIONS',
  STOCK_TRANSGENES = 'STOCK_TRANSGENES',
}

export class TankLabelConfig {
  fontPointSize: number = 12;
  fontFamily: string = 'Helvetica';
  heightInInches: number = 1.25;
  widthInInches: number = 3.5;
  showQrCode: boolean = false;
  layout: string[][];
}
