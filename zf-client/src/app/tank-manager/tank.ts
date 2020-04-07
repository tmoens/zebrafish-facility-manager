export class Tank {
  id: number = null;
  comment?: string;
  name: string;
  rack?: string;
  shelf?: string;
  slot?: string;

  containsString(searchString: string): boolean {
    return false;
  }

}
