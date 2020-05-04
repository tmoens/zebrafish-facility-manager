import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../login/login.component";
import {PasswordResetComponent} from "../password-reset/password-reset.component";
import {PasswordChangeComponent} from "./password-change.component";

@Component({
  selector: 'app-password-change-container',
  template: ``,
})
export class PasswordChangeContainerComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.openDialog();
  }

  openDialog() {
    const dialogRef = this.dialog.open(PasswordChangeComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {});
  }

}
