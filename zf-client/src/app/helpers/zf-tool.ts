// Typescript does not allow enums with values as objects.
// The following is a clever workaround from the internet...
import {ZFTypes} from "./zf-types";

export class ZFTool {
  static readonly SPLASH_LOGIN  = new ZFTool(
    'login',
    ZFTypes.LOGIN,
    'Zebrafish Facility Manager');
  static readonly USER_MANAGER  = new ZFTool(
    'user_admin',
    ZFTypes.USER,
    'User Admin');
  static readonly STOCK_MANAGER  = new ZFTool(
    'stock_manager',
    ZFTypes.STOCK,
    'Stocks');
  static readonly MUTATION_MANAGER = new ZFTool(
    'mutation_manager',
    ZFTypes.MUTATION,
    'Mutations');
  static readonly TRANSGENE_MANAGER  = new ZFTool(
    'transgene_manager',
    ZFTypes.TRANSGENE,
    'Transgenes');
  static readonly IMPORT_TOOL  = new ZFTool(
    'importer',
    ZFTypes.MUTATION,
    'Import Tool');

  // private to disallow creating other instances than the static ones above.
  private constructor(
    public readonly route: string,
    public readonly type: ZFTypes,
    public readonly display_name: any,
  ) {
  }

  // If you talk about a particular tool without specifying an attribute, you get it's route.
  toString() {
    return this.route;
  }
}
