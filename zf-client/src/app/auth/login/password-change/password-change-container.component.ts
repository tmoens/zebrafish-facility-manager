import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordChangeComponent} from "./password-change.component";
import {Location} from "@angular/common";

@Component({
  selector: 'app-password-change-container',
  template: ``,
})
export class PasswordChangeContainerComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.openDialog();
  }

  openDialog() {
    const dialogRef = this.dialog.open(PasswordChangeComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {
      this.location.back();
    });
  }

}
