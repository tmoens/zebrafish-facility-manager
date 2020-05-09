import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'dateToAge'
})
export class DateToAgePipe implements PipeTransform {

  transform(dateAsString: string): number {
    return Math.floor(moment.duration(moment().diff(moment(dateAsString))).asDays());
  }

}
