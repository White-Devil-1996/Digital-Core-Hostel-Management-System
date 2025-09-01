
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import Swal from 'sweetalert2';
import { Label } from '../label/label';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTabsModule,Label,FormsModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  selectedTab = 0;
  menuLabel = 'Settings';


  pgProfileForm!: FormGroup; 

  rentRulesForm!: FormGroup; 
    paymentOptionsForm!: FormGroup; 

      notificationForm!: FormGroup; 

  

  userRoles = [
    { role: 'Admin', description: 'Full access' },
    { role: 'Staff', description: 'Limited access' },
    { role: 'Resident', description: 'View only' }
  ];

  // constructor(private fb: FormBuilder) {}
  // pgProfileForm: FormGroup;

constructor(private fb: FormBuilder) {
this.pgProfileForm = this.fb.group({
  name: ['', Validators.required],
  address: ['', Validators.required],
  contact: ['', Validators.required],
  logo: ['']
}) as FormGroup<{ [key in 'name' | 'address' | 'contact' | 'logo']: FormControl<string | null> }>};

  ngOnInit(): void {
    this.pgProfileForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      contact: ['', Validators.required],
      logo: ['']
    });

    this.rentRulesForm = this.fb.group({
      dueDate: [5, [Validators.required, Validators.min(1), Validators.max(31)]],
      lateFee: [0, Validators.required],
      depositPolicy: ['']
    });

    this.paymentOptionsForm = this.fb.group({
      upiId: [''],
      bankAccount: [''],
    enableQR: [true]
  });

    this.notificationForm = this.fb.group({
      whatsappTemplate: [''],
    smsTemplate: [''],
    emailTemplate: ['']
  });
  }

  saveForm(formName: string) {
    Swal.fire({ icon: 'success', title: `${formName} saved!`, timer: 1200, showConfirmButton: false });
  }

  uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.pgProfileForm.patchValue({ logo: reader.result });
    reader.readAsDataURL(file);
  }
}
