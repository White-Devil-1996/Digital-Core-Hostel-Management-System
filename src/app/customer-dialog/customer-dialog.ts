import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { CustomerOnboarding } from '../customer-onboarding/customer-onboarding';
import { ActivationStart } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customer-dialog',
  imports: [ CustomerOnboarding,FormsModule,MatDialogModule,MatIconModule],
  templateUrl: './customer-dialog.html',
  styleUrl: './customer-dialog.scss'
})
export class CustomerDialog {
  constructor(
    public dialogRef: MatDialogRef<CustomerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  closeDialog(success: boolean = false) {
    this.dialogRef.close(success); // ✅ Pass true if API success
  }
}
