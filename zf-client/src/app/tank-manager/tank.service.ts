import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {Observable, of} from 'rxjs';
import {Tank} from './tank';
import {TankDto} from '../common/tank.dto';
import {SwimmerFullDto} from '../common/swimmer-full.dto';
import {SwimmerDto} from '../common/swimmer.dto';
import {plainToClass} from 'class-transformer';
import {ZFTypes} from '../helpers/zf-types';

/**
 * This is mostly just a cache of all the known tanks at the facility.
 *
 * Its only purpose is to help the GUI respond relatively quickly when the user
 * is typing a tank name, no round trips to the server.
 *
 * Since tanks in a facility do not change (well, almost never), it does not have
 * to be refreshed automatically.
 */


@Injectable({
  providedIn: 'root'
})
export class TankService {
  private indexedAll: { [key: string]: Tank };

  constructor(
    private readonly loader: LoaderService,
  ) {
    this.loadAllTanks();
  }

  loadAllTanks() {
    this.loader.getFilteredList(ZFTypes.TANK, {}).subscribe((data: TankDto[]) => {
      this.indexedAll = {};
      for (const tank of data) {
        this.indexedAll[tank.name.toLowerCase()] = plainToClass(Tank, tank);
      }
    });
  }

  getTankByName(putativeName: string): Tank | null {
    if (!putativeName) return null;
    if (this.indexedAll[putativeName.toLowerCase()]) {
      return this.indexedAll[putativeName.toLowerCase()];
    } else {
      return null;
    }
  }

  isValidName(tankName: string): boolean {
    return !!(this.indexedAll[tankName.toLowerCase()]);
  }

  // find out which stocks are currently in a given tank.
  getSwimmers(tankName: string): Observable<SwimmerFullDto[]> {
    const tank: Tank = this.getTankByName(tankName);
    if (!tank) { return of([]); }
    return this.loader.getStocksInTank(tank.id);
  }

  addSwimmer(swimmer: SwimmerDto) {
    return this.loader.create(ZFTypes.SWIMMER, swimmer);
  }

  deleteSwimmer(swimmer: SwimmerDto) {
    return this.loader.deleteSwimmer(swimmer);
  }

  updateSwimmer(swimmer: SwimmerDto) {
    return this.loader.update(ZFTypes.SWIMMER, swimmer);
  }
}
