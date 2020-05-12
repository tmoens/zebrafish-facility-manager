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
  inFocusTank: TankWalkerDto;

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

  // Decision: since there are only two fields and we want this to be 
  // really easy, we do not ask the user to explicitly "save" changes
  // to the number of fish in the tank or the comment.
  // If they have changed when we navigate away, save the changes.
  goToIndex(newIndex: number) {
    if (this.inFocusIndex > -1) {
      if ((this.countFC.value !== this.inFocusTank.num) || 
          (this.commentFC.value !== this.inFocusTank.comment)) {
        this.inFocusTank.num = this.countFC.value;
        this.inFocusTank.comment = this.commentFC.value;
        this.save();
      }
    }
    this.inFocusIndex = newIndex;
    this.inFocusTank = this.tankList[this.inFocusIndex];
    this.countFC.setValue(this.inFocusTank.num);
    this.commentFC.setValue(this.inFocusTank.comment);
    
    this.getInFocusStock();
  }

  getInFocusStock() {
    this.loader.getTankWalkerStock(this.tankList[this.inFocusIndex].stockId)
      .subscribe( s => this.inFocusStock = s);
  }



  save() {
    const swimmerDto: StockSwimmerDto = {
      stockId: Number(this.tankList[this.inFocusIndex].stockId),
      tankId: Number(this.tankList[this.inFocusIndex].tankId),
      number: this.countFC.value,
      comment: this.commentFC.value,
    }
    this.tankService.updateSwimmer(swimmerDto).subscribe();
    }

  done() {
    this.location.back();
  }
}
