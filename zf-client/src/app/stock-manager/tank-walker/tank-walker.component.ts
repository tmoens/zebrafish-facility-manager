import { Component, OnInit } from '@angular/core';
import {TankWalkerDto} from "./tank-walker-dto";
import {StockService} from "../stock.service";
import {StockFullDto} from "../dto/stock-full-dto";
import {AppStateService} from "../../app-state.service";
import {Location} from "@angular/common";
import {FormControl} from "@angular/forms";
import {LoaderService} from "../../loader.service";
import {TankService} from "../../tank-manager/tank.service";
import {StockSwimmerDto} from "../../tank-manager/stock-swimmer-dto";

@Component({
  selector: 'app-stock-walker',
  templateUrl: './tank-walker.component.html',
  styleUrls: ['./tank-walker.component.scss'],
})
export class TankWalkerComponent implements OnInit {
  tankList: TankWalkerDto[];
  inFocusIndex = -1;
  inFocusStock: StockFullDto;

  countFC: FormControl = new FormControl();
  commentFC: FormControl = new FormControl();

  constructor(
    public service: StockService,
    public tankService: TankService,
    public loader: LoaderService,
    public appState: AppStateService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    // we are not actually entering edit mode.  That function was badly named.
    // What we *are* doing is going into the stock walker and for that, we want
    // the stock selector to be tucked away, which is all that "enterEditMode" does.
    this.service.enterEditMode();

    this.service.getStockWalkerList().subscribe(data => {
      this.tankList = data;
      if (this.tankList.length > 0) {
        this.goToIndex(0);
      }
    });
  }

  goToIndex(index: number) {
    this.inFocusIndex = index;
    this.countFC.setValue(this.tankList[this.inFocusIndex].num);
    this.commentFC.setValue(this.tankList[this.inFocusIndex].comment);
    this.getInFocusStock();
  }

  getInFocusStock() {
    this.loader.getTankWalkerStock(this.tankList[this.inFocusIndex].stockId)
      .subscribe( s => this.inFocusStock = s);
  }



  onSave() {
    const swimmerDto: StockSwimmerDto = {
      stockId: Number(this.tankList[this.inFocusIndex].stockId),
      tankId: Number(this.tankList[this.inFocusIndex].tankId),
      number: this.countFC.value,
      comment: this.commentFC.value,
    }
    this.tankService.updateSwimmer(swimmerDto).subscribe();
    this.tankList[this.inFocusIndex].num = this.countFC.value;
    this.tankList[this.inFocusIndex].comment = this.commentFC.value;

    }

  done() {
    this.location.back();
  }
}
