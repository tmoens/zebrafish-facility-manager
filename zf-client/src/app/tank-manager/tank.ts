export class Tank {
  id: number = null;
  comment?: string;
  name: string;
  rack?: string;
  shelf?: string;
  slot?: string;
  sortOrder: string;
  isMultiTank: boolean;

  containsString(searchString: string): boolean {
    return false;
  }

}
