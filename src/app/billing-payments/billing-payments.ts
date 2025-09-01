import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators,FormControl  } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { Label } from '../label/label';

@Component({
  selector: 'app-billing-payments',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatDividerModule, MatExpansionModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,Label
  ],
  templateUrl: './billing-payments.html',
  styleUrls: ['./billing-payments.scss']
})
export class BillingPaymentsComponent {


  
menuLabel = 'Billing Payments';



 searchTerm = '';

  // Signals / reactive state
  // summary = signal<any>({});
  // deposit = signal<any>({});
  // invoices = signal<any[]>([]);
  // payments = signal<any[]>([]);
  // extras = signal<any[]>([]);
  // alerts = signal<any[]>([]);
  // dueDate: Date | null = null;





  // ---- Mocked summary data
  summary = {
    rentDue: 12000,
    paidSoFar: 8000
  };

  // Next due date (e.g., 5th Sep 2025)
  dueDate = new Date(2025, 8, 5); // months are 0-indexed

  // Deposit
  deposit = {
    total: 20000,
    adjusted: 0
  };

  // Invoices
  invoices = signal<Array<{
    number: string;
    date: Date;
    category: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Partial';
  }>>([
    { number: 'INV-2025-08-001', date: new Date(2025,7,5), category: 'Rent', amount: 12000, status: 'Partial' },
    { number: 'INV-2025-08-002', date: new Date(2025,7,10), category: 'Electricity', amount: 800, status: 'Pending' },
    { number: 'INV-2025-08-003', date: new Date(2025,7,12), category: 'WiFi', amount: 500, status: 'Paid' },
    { number: 'INV-2025-08-004', date: new Date(2025,7,15), category: 'Laundry', amount: 300, status: 'Paid' },
  ]);

  // Payments
  payments = signal<Array<{
    date: Date; mode: string; amount: number; invoiceRef: string; success: boolean;
  }>>([
    { date: new Date(2025,7,6), mode:'UPI', amount: 6000, invoiceRef: 'INV-2025-08-001', success: true },
    { date: new Date(2025,7,14), mode:'Card', amount: 500, invoiceRef: 'INV-2025-08-003', success: true },
    { date: new Date(2025,7,16), mode:'UPI', amount: 300, invoiceRef: 'INV-2025-08-004', success: true },
  ]);

  // Extras
  extras = signal<Array<{ name:string; type:string; unit:string; amount:number; notes?:string }>>([
    { name:'Laundry', type:'Per Kg', unit:'5 kg', amount:300 },
    { name:'Food', type:'Monthly', unit:'Aug 2025', amount:3500, notes:'Veg plan' },
    { name:'WiFi', type:'Monthly', unit:'Aug 2025', amount:500 },
  ]);

  // Alerts
  alerts = signal<Array<{ type:'info'|'warn'|'danger'|'success'; icon:string; title:string; message:string }>>([
    { type:'warn', icon:'schedule', title:'Upcoming Due', message:'Rent due on 05 Sep 2025.' },
    { type:'danger', icon:'priority_high', title:'Pending Invoice', message:'Electricity bill still unpaid.' },
    { type:'success', icon:'check_circle', title:'Payment Received', message:'₹6,000 received via UPI for Aug rent.' }
  ]);

  // Payment form
  payForm: ReturnType<FormBuilder['group']>;

  // constructor(private fb: FormBuilder) {
  //   this.payForm = this.fb.group<{
  //     amount: number | null;
  //     mode: string;
  //     upiId: string;
  //   }>({
  //     amount: [null, [Validators.required, Validators.min(1)]],
  //     mode:   ['UPI', [Validators.required]],
  //     upiId:  ['']
  //   });
  //   // Keep amount default to max payable when form switches mode, etc.
  //   effect(() => {
  //     const max = this.maxPayable();
  //     if (!this.payForm.value.amount || (this.payForm.value.amount as number) > max) {
  //       this.payForm.patchValue({ amount: max }, { emitEvent: false });
  //     }
  //   });
  // }

  constructor(private fb: FormBuilder) {
  // this.payForm = this.fb.group<{
  //   amount: number | null;
  //   mode: string;
  //   upiId: string;
  // }>({
  //   amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
  //   mode:   new FormControl<string>('UPI', { validators: [Validators.required] }),
  //   upiId:  new FormControl<string>('', { nonNullable: true })   // ✅ matches string
  // });

  this.payForm = this.fb.group({
  amount: [null, [Validators.required, Validators.min(1)]],
  mode:   ['UPI', [Validators.required]],
  upiId:  ['']
});
}

  // ---- Computed helpers

  balance = computed(() => Math.max(this.summary.rentDue - this.summary.paidSoFar, 0));

  isOverdue(): boolean {
    const today = new Date();
    const due = new Date(this.dueDate.getFullYear(), this.dueDate.getMonth(), this.dueDate.getDate(), 23, 59, 59);
    return today > due && this.outstanding() > 0;
  }

  // Simple late fee logic: flat ₹100 if overdue + 1% of outstanding per day after due date
  lateFee = computed(() => {
    if (!this.isOverdue()) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((Date.now() - this.dueDate.getTime()) / msPerDay);
    const base = this.outstanding();
    return Math.max(100 + Math.round(base * 0.01 * days), 0);
  });

  outstanding = computed(() => {
    // pending + partial amounts from all invoices
    const pending = this.invoices().filter(i => i.status !== 'Paid')
                    .reduce((sum, i) => sum + i.amount, 0);
    return pending;
  });

  depositRefundable = computed(() => Math.max(this.deposit.total - this.deposit.adjusted, 0));

  maxPayable() {
    return this.outstanding() + this.lateFee();
  }

  // ---- Actions (stubs you can wire to real APIs)

  downloadInvoice(inv: any) {
    Swal.fire({
      icon: 'info',
      title: 'Downloading Invoice',
      text: `${inv.number} (${inv.category})`,
      timer: 1200,
      showConfirmButton: false
    });
    // TODO: call your real PDF generator here
  }

  downloadReceipt(inv: any) {
    if (inv.status !== 'Paid') return;
    Swal.fire({
      icon: 'success',
      title: 'Receipt Downloaded',
      text: `Receipt for ${inv.number}`,
      timer: 1200,
      showConfirmButton: false
    });
    // TODO: call your real receipt generator here
  }

  exportStatement() {
    Swal.fire({
      icon: 'info',
      title: 'Generating Statement',
      text: 'Exporting to PDF/Excel…',
      timer: 1200,
      showConfirmButton: false
    });
    // TODO: build & download statement file
  }

  makePayment() {
    if (this.payForm.invalid) { this.payForm.markAllAsTouched(); return; }

    const amt = this.payForm.value.amount!;
    const mode = this.payForm.value.mode!;
    const late = this.lateFee();

    Swal.fire({
      title: 'Confirm Payment',
      html: `
        <div style="text-align:left">
          <p><b>Amount:</b> ₹${amt?.toLocaleString()}</p>
          <p><b>Mode:</b> ${mode}</p>
          ${late > 0 ? `<p style="color:#ef6c00"><b>Includes Late Fee:</b> ₹${late.toLocaleString()}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Pay',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: { popup: 'swal2-container' }
    }).then(res => {
      if (!res.isConfirmed) return;

      // Simulate API call
      Swal.fire({
        title: 'Processing…',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      setTimeout(() => {
        // Update mock data as if payment succeeded
        const remaining = this.outstanding();
        const used = Math.min(amt, remaining + late);
        this.summary.paidSoFar += used; // reflect on summary
        // push a payment history item
        this.payments.update(list => [
          { date: new Date(), mode, amount: amt, invoiceRef: 'AUTO', success: true },
          ...list
        ]);
        // mark some invoices as paid/partial for demo
        this.settleInvoices(amt - late);

        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful',
          text: `₹${amt.toLocaleString()} paid via ${mode}.`,
          timer: 1600,
          showConfirmButton: false
        });

        this.payForm.reset({ amount: this.maxPayable(), mode: 'UPI', upiId: '' });
      }, 1000);
    });
  }

  private settleInvoices(amountToUse: number) {
    if (amountToUse <= 0) return;
    const updated = this.invoices().map(inv => ({ ...inv }));

    for (const inv of updated) {
      if (inv.status === 'Paid') continue;
      if (amountToUse <= 0) break;

      if (amountToUse >= inv.amount) {
        amountToUse -= inv.amount;
        inv.amount = 0;
        inv.status = 'Paid';
      } else {
        inv.amount -= amountToUse;
        amountToUse = 0;
        inv.status = 'Partial';
      }
    }
    this.invoices.set(updated);
  }


  // searchTerm: string = '';

searchCustomer() {
  console.log('Searching for:', this.searchTerm);
  // later you can filter invoices/payments here
}
}
