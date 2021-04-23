import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import {SwimmerFullDto} from '../../common/swimmer-full.dto';
import {StockService} from '../../stock-manager/stock.service';
import {StockDto} from '../../stock-manager/dto/stock-dto';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-swimmer-editor',
  template: `
    <form [formGroup]="swimmerForm" fxLayout="row" fxLayoutGap="10px" style="width: 100%">
      <button mat-icon-button *ngIf="!isNew && !stockNameChanged && !swimmerCountChanged" color="primary">
        <mat-icon (click)="onDelete()">delete</mat-icon>
      </button>
      <button mat-icon-button *ngIf="!isNew && (stockNameChanged || swimmerCountChanged)"
              [disabled]="!stockExists" color="primary">
        <mat-icon (click)="onChange()">publish</mat-icon>
      </button>
      <button mat-icon-button *ngIf="isNew" [disabled]="!stockExists" color="primary">
        <mat-icon (click)="onChange()">add</mat-icon>
      </button>
      <mat-form-field fxFlex>
        <input matInput type="text" placeholder="Stock Number" formControlName="stockName">
        <mat-hint>{{stockHint}}</mat-hint>
      </mat-form-field>
      <mat-form-field fxFlex="25%">
        <input matInput type="number"
               placeholder="Count" required min="1" formControlName="swimmerCount">
      </mat-form-field>
    </form>
  `,
  styleUrls: ['./swimmer-editor.component.scss']
})
export class SwimmerEditorComponent implements OnInit {
  @Input('swimmer')
  inputSwimmer: SwimmerFullDto;
  swimmer: SwimmerFullDto;

  @Output()
  fred: EventEmitter<SwimmerFullDto> = new EventEmitter<SwimmerFullDto>();

  @Output()
  delete: EventEmitter<SwimmerFullDto> = new EventEmitter<SwimmerFullDto>();

  // We are adding a stock
  isNew: boolean;

  // The stock name the user has entered exists
  stockExists: boolean;

  // The user has changed the stock name.
  stockNameChanged: boolean;

  // the user has changed the swimmer count
  swimmerCountChanged: boolean;

  // keeps the user informed about this stock name/number field.
  stockHint: string;

  swimmerForm = this.fb.group( {
    stockName: [''],
    swimmerCount: [1, [Validators.min(1), Validators.required]],
  });

  get swimmerCountFC() {
    return this.swimmerForm.get('swimmerCount');
  }
  get stockNameFC() {
    return this.swimmerForm.get('stockName');
  }

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
  ) { }

  ngOnInit(): void {
    this.swimmer = {...this.inputSwimmer}
    this.stockNameChanged = false;
    if (this.swimmer.stock) {
      this.isNew = false;
      this.stockExists = true;
      this.stockNameFC.setValue(this.swimmer.stock.name);
      this.stockHint = this.swimmer.stock.alleleSummary;
    } else {
      this.stockExists = false;
      this.isNew = true;
    }
    this.swimmerCountFC.setValue(this.swimmer.number);

    this.stockNameFC.valueChanges.subscribe(value => this.onStockNameChange(value));
    this.swimmerCountFC.valueChanges.subscribe(value => this.onSwimmerCountChange(value));
  }

  // every time the user touches the stock name/number field, see if they have typed in
  // a valid stock. If so, update the server..
  onStockNameChange(name: string) {
    if (!name) {
      this.stockNameChanged = !this.isNew;
      return;
    }
    this.stockService.getByName(name).subscribe((fetchedStock: StockDto) => {
      if (fetchedStock && fetchedStock.id) {
        this.stockExists = true;
        this.stockHint = fetchedStock.description;
        this.swimmerCountFC.enable({emitEvent: false})
        if (this.inputSwimmer.stock && fetchedStock.id === this.inputSwimmer.stock.id) {
          this.stockNameChanged = false;
          return;
        } else {
          this.stockNameChanged = true;
          this.swimmer.stockId = fetchedStock.id;
          this.swimmer.stock = fetchedStock;
        }
      } else {
        this.swimmerCountFC.disable({emitEvent: false})
        this.stockExists =false;
        this.stockNameChanged = true;
        this.stockHint = 'Unknown stock number'
      }
    });
  }

  onSwimmerCountChange(value) {
    this.swimmer.number = value;
    this.swimmerCountChanged = !(this.inputSwimmer.number === value)
  }

  onChange() {
    this.fred.emit(this.swimmer);
  }

  onDelete() {
    this.delete.emit(this.swimmer);
  }
}
