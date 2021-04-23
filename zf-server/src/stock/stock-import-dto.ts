// TODO seems that name and internal mom and internal dad are being interpreted as numbers
export class StockImportDto {
  name?: string;
  description?: string;
  comment?: string;
  internalMom?: string;
  internalDad?: string
  researcherUsername?: string;
  piUsername?: string;
  fertilizationDate?: string;
  countEnteringNursery?: number;
  countLeavingNursery?: number;
  alleles?: string;
  externalMomName?: string;
  externalMomDescription?: string;
  externalDadName?: string;
  externalDadDescription?: string;
  tank1Name?:string;
  tank1Count?:number;
  tank2Name?:string;
  tank2Count?:number;
  tank3Name?:string;
  tank3Count?:number;
  tank4Name?:string;
  tank4Count?:number;
  tank5Name?:string;
  tank5Count?:number;
  tank6Name?:string;
  tank6Count?:number;
}

export class SwimmerImportDto {
  stockId: number;
  tankId: number;
  number: number;
  comment?: string;
}

