export abstract class ZfGenericClass {
  id: number = null;
  isDeletable = false;

  // protected constructor() {}
  public constructor() {
  }

  abstract get name(): string;
  containsString(s: string): boolean { return false; }
}
