import {Component, Inject, } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'can-deactivate',
  templateUrl: './can-deactivate-component.html',
  styleUrls: ['./can-deactivate-component.scss']
})
export class CanDeactivateComponent {

  constructor(
    public dialogRef: MatDialogRef<CanDeactivateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; },
    ) {}

  ignoreChanges() {
    this.dialogRef.close(true);
  }

  continueEditing() {
    this.dialogRef.close(false);
  }
}
