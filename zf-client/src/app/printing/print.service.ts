import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  isPrinting = false;

  constructor(
    private router: Router,
    private location: Location,
  ) { }

  printDocument(documentName: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      {
        outlets: {
          'print': ['print', documentName]
        }
      }]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      // this.location.back();
      this.router.navigate([{outlets: {print: null}}]);
    });
  }
}
