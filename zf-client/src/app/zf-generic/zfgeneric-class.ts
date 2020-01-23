export abstract class ZfGenericClass {
  id: number = null;
  isDeletable = false;

  // protected constructor() {}
  public constructor() {
  }

  abstract get name(): string;
  get tooltip(): string { return null; }
  containsString(s: string): boolean { return false; }
}
