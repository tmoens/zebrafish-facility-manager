
export class StockFilter {
  text: string = null;
  liveStocksOnly = false;
  number: string = null;
  tankName: string = null;
  mutation: string = null;
  mutationId: number = null;
  transgene: string = null;
  transgeneId: number = null;
  age: number = null;
  ageModifier: string = null;
  researcherId: string = null;
  piId: string = null;

  public constructor( init?: Partial<StockFilter>) {
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(
      this.text || this.liveStocksOnly || this.number ||
      this.tankName || this.mutation || this.transgene ||
      this.mutationId || this.transgeneId || this.age ||
      this.researcherId || this.piId);
  }
}
