export abstract class ZfGenericDto {
  id: number = null;
  name: string = null;
  fullName: string = null;
  isDeletable: boolean = false;

  get internalLinkLabel(): string {
    return null;
  }

  get title(): string {
    return null;
  }

  get details(): string[] {
    return [];
  }

  get externalLinkLabel(): string {
    return null;
  }

  get externalLinkURL(): string {
    return null;
  }
}
