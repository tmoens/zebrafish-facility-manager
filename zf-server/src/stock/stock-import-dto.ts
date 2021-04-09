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
  alleles?: string;
  externalMomName?: string;
  externalMomDescription?: string;
  externalDadName?: string;
  externalDadDescription?: string;
}
