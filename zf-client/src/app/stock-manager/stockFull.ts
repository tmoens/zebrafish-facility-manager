import {ZfGenericClass} from '../zf-generic/zfgeneric-class';
import {Stock} from './stock';
import {Transgene} from '../transgene-manager/transgene';
import {Mutation} from '../mutation-manager/mutation';
import {StockSwimmerDto} from '../tank-manager/stock-swimmer-dto';
import * as moment from "moment";


// All the fields in a stock including related objects like parents and transgenes.
export class StockFull extends ZfGenericClass {
  // id: number = null; // from generic
  // isDeletable: boolean = false; // from generic
  name: string = null;
  number: number = null;
  subNumber: number = null;
  description: string = null;
  fertilizationDate: string = null;
  pi: string = null;
  researcher: string = null;
  background: number = null;
  matIdInternal: number = null;
  externalMatId: string = null;
  externalMatDescription: string = null;
  patIdInternal: number = null;
  externalPatId: string = null;
  externalPatDescription: string = null;
  comment: string = null;
  matStock: Stock = null;
  patStock: Stock = null;
  swimmers: StockSwimmerDto[] = [];
  transgenes: Transgene[] = [];
  mutations: Mutation[] = [];
  offspringCount: number = null;
  nextSubStockNumber: number = null;
  parentsEditable = false;
  offspring: Stock[] = [];

  public constructor( ) {
    super();
  }

  // You cannot edit the fertilization date if there are subStocks.
  fertilizationDateEditable(): boolean {
    return this.nextSubStockNumber <= 1;
  }

    age(): number {

      return Math.floor(moment.duration(moment().diff(moment(this.fertilizationDate))).asDays());
    }

}


