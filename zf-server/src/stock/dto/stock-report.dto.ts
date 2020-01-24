export class StockReportDto {
  Stock: string;
  Description?: string;
  DOB?: string;
  Researcher?: string;
  Mom?: string;
  Dad?: string;
  Mutations?: string;
  Transgenes?: string;
  Tanks?: string;

  public constructor( init: Partial<StockReportDto>) {
    Object.assign(this, init);
  }
}
