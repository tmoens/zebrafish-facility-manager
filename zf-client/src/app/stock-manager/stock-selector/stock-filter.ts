
export class StockFilter {
  text: string = null;
  liveStocksOnly = false;
  number: string = null;
  researcher: string = null;
  pi: string = null;
  tankName: string = null;
  mutation: string = null;
  mutationId: number = null;
  transgene: string = null;
  transgeneId: number = null;
  age: number = null;
  ageModifier: string = null;

  public constructor( init?: Partial<StockFilter>) {
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(
      this.text || this.liveStocksOnly || this.number || this.researcher ||
      this.tankName || this.mutation || this.transgene);
  }
}
