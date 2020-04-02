import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {LoaderService} from "../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CONFIRM_MESSAGE_DURATION} from "../../constants";
import {FormBuilder, Validators} from "@angular/forms";
import {UserPasswordChangeDTO} from "../../common/user/UserDTO";
import {AppStateService} from "../../app-state.service";

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {

  mfForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    repeatNewPassword: ['', [Validators.required]],
  } );

  constructor(
    public dialogRef: MatDialogRef<PasswordChangeComponent>,
    private loaderService: LoaderService,
    private message: MatSnackBar,
    private fb: FormBuilder,
    private appState: AppStateService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    //TODO duplicate password verification
    const dto: UserPasswordChangeDTO = this.mfForm.getRawValue();
    this.loaderService.passwordChange(dto).subscribe( (token: any) => {
      if (token) {
        this.dialogRef.close();
        this.appState.onLogin(token.accessToken);
        this.message.open(
          "Your password has been changed.",
          null, {duration: CONFIRM_MESSAGE_DURATION});
      }
    });
  }

}
