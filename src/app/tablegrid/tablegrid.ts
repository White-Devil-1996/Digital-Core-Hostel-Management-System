import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, Input, input } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination'; // ✅ Add this
import { CustomerDialog } from '../customer-dialog/customer-dialog';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';


declare let pdfMake: any;

@Component({
  selector: 'app-tablegrid',
  imports: [NgxPaginationModule, CommonModule, FormsModule],
  templateUrl: './tablegrid.html',
  styleUrl: './tablegrid.scss'
})
export class Tablegrid {
  // @Input() data: any[] = [];
  searchText: string = '';
  filterGender: string = '';
  filterSharing: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  res: any;
  p: number = 1; // ✅ Current page number
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private dialog: MatDialog) { }



  async ngOnInit(): Promise<void> {
    // this.res = this.data;

    this.res = this.data;

    this.cdr.detectChanges();
  }

  async generateInvoicePDF(customer: any, passportPhotoFile?: File, idProofFile?: File) {

    const primaryColor =
      getComputedStyle(document.documentElement).getPropertyValue('--primarycolor').trim() ||
      '#6b4e00';

    // Convert images if provided
    let passportBase64: string | null = null;
    let idProofBase64: string | null = null;

    // Convert uploaded passport photo
    if (passportPhotoFile) {
      passportBase64 = await this.convertFileToBase64(passportPhotoFile);
    } else if (customer.upload_passport_size_photo && customer.upload_passport_size_photo.startsWith('data:image')) {
      passportBase64 = customer.upload_passport_size_photo; // already base64
    }

    // Convert uploaded ID proof
    if (idProofFile) {
      idProofBase64 = await this.convertFileToBase64(idProofFile);
    } else if (customer.upload_id_proof__pdf_image_ && customer.upload_id_proof__pdf_image_.startsWith('data:image')) {
      idProofBase64 = customer.upload_id_proof__pdf_image_;
    }




    const docDefinition: any = {
      content: [
        // HEADER with photo
        {
          columns: [
            {
              stack: [
                { text: 'Nestora Elite', style: 'companyName' },
                { text: 'NO:22, MGR Main Rd, Anna Salai, Santhiyappan Street' },
                { text: 'Kandhanchavadi, Perungudi, Chennai, Tamil Nadu 600096' },
                { text: 'Phone: 094457 71646' },
                { text: 'Email: nestoraelite@example.com' },
                { text: 'GSTIN: 22AAAAA0000A1Z5' }
              ]
            },
            {
              stack: [
                { text: 'INVOICE', style: 'header' },
                { text: `Invoice No.: #${Math.floor(Math.random() * 10000)}` },
                { text: `Invoice Date: ${new Date().toLocaleDateString()}` },
                { text: `Due Date: ${new Date().toLocaleDateString()}` },
                passportBase64
                  ? {
                    image: passportBase64,
                    fit: [80, 100],
                    alignment: 'right',
                    margin: [0, 10, 0, 0]
                  }
                  : { text: 'No Photo', italics: true, color: 'gray', alignment: 'right' }
              ],
              alignment: 'right'
            }
          ]
        },

        { text: '\n' },

        // BILL TO + ROOM DETAILS
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'BILL TO (Permanent Address)', style: 'sectionHeader' },
                { text: customer.full_name, bold: true },
                { text: `Mobile: ${customer.mobile_number}` },
                { text: `Alternate: ${customer.alternate_number}` },
                { text: `Email: ${customer.email_id}` },
                { text: `Permanent Address: ${customer.permanent_address}` },
                { text: `City: ${customer.city}, ${customer.state} - ${customer.pincode}` },
                { text: `Guardian: ${customer.father_s___guardian_s_name} (${customer.relationship})` },
                { text: `Emergency Contact: ${customer.emergency_contact_name}` }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'ROOM DETAILS', style: 'sectionHeader' },
                { text: `Room No: ${customer.room_number}`, bold: true },
                { text: `Bed No: ${customer.bed_number}` },
                { text: `Sharing Type: ${customer.room_sharing_type}` },
                { text: `Check-in Date: ${customer.check_in_date}` },
                { text: `Monthly Rent: ₹${customer.monthly_rent}` },
                { text: `Security Deposit: ₹${customer.security_deposit}` }
              ]
            }
          ]
        },

        { text: '\n' },

        // CUSTOMER DETAILS TABLE
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [{ text: 'Gender', style: 'tableHeader' }, customer.gender],
              [{ text: 'Date of Birth', style: 'tableHeader' }, customer.date_of_birth],
              [{ text: 'Occupation', style: 'tableHeader' }, customer.occupation],
              [{ text: 'Work/Study Address', style: 'tableHeader' }, customer.work___study_address],
              [{ text: 'Company/College Name', style: 'tableHeader' }, customer.company___college_name],
              [{ text: 'ID Type', style: 'tableHeader' }, customer.id_type],
              [{ text: 'ID Number', style: 'tableHeader' }, customer.id_number]
            ]
          },
          layout: 'lightHorizontalLines'
        },

        idProofBase64
          ? {
            text: '\nID Proof:',
            style: 'sectionHeader',
            margin: [0, 10, 0, 5]
          }
          : {},

        idProofBase64
          ? {
            image: idProofBase64,
            fit: [150, 100],
            margin: [0, 0, 0, 10]
          }
          : {},

        { text: '\n' },

        // INVOICE ITEMS
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'DESCRIPTION', style: 'tableHeader' },
                { text: 'QTY', style: 'tableHeader' },
                { text: 'UNIT PRICE', style: 'tableHeader' },
                { text: 'TOTAL', style: 'tableHeader' }
              ],
              [
                `Monthly Rent - Room ${customer.room_number} (${customer.room_sharing_type})`,
                '1',
                customer.monthly_rent,
                customer.monthly_rent
              ],
              ['Security Deposit', '1', customer.security_deposit, customer.security_deposit]
            ]
          }
        },

        { text: '\n' },

        // TOTALS & NOTES
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Notes & Terms', bold: true },
                { text: '✔ Thank you for choosing Nestora Elite!' },
                { text: '✔ Payment Mode: UPI / Bank Transfer' },
                { text: `✔ Advance Paid: ₹${customer.advance_paid_so_for}` },
                { text: `✔ Rent Paid so far: ₹${customer.rent_paid_so_for}` },
                { text: '\n\n\n' },
                { text: 'Authorized Signatory', italics: true }
              ]
            },
            {
              width: '50%',
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    'SUBTOTAL',
                    `₹${parseFloat(customer.monthly_rent) + parseFloat(customer.security_deposit)}`
                  ],
                  ['DISCOUNT', '₹0.00'],
                  [
                    'SUBTOTAL LESS DISCOUNT',
                    `₹${parseFloat(customer.monthly_rent) + parseFloat(customer.security_deposit)}`
                  ],
                  ['CGST @ 5%', '₹0.00'],
                  ['SGST @ 5%', '₹0.00'],
                  ['Advance Paid', `₹${customer.advance_paid_so_for}`],
                  ['Rent Paid So Far', `₹${customer.rent_paid_so_for}`],
                  [
                    { text: 'Balance Due', bold: true },
                    {
                      text: `₹${parseFloat(customer.monthly_rent) +
                        parseFloat(customer.security_deposit) -
                        (parseFloat(customer.advance_paid_so_for) || 0)
                        }`,
                      bold: true
                    }
                  ],
                  [
                    { text: 'GRAND TOTAL', bold: true, fillColor: primaryColor },
                    {
                      text: `₹${parseFloat(customer.monthly_rent) + parseFloat(customer.security_deposit)}`,
                      bold: true,
                      fillColor: primaryColor
                    }
                  ]
                ]
              },
              layout: 'lightHorizontalLines'
            }
          ]
        }
      ],

      styles: {
        header: { fontSize: 22, bold: true, color: primaryColor, margin: [0, 0, 0, 10] },
        companyName: { fontSize: 16, bold: true, color: primaryColor, margin: [0, 0, 0, 5] },
        sectionHeader: { fontSize: 12, bold: true, color: primaryColor, margin: [0, 5] },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white',
          fillColor: primaryColor,
          alignment: 'center'
        }
      },
      defaultStyle: { fontSize: 10 }
    };

    pdfMake.createPdf(docDefinition).download(`${customer.full_name}_Invoice.pdf`);
  }




  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }





  trackByFirstName(index: number, item: any) {
    return item.firstName;
  }


  async update(val: object) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to update this record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        // try {

        //   this.dialog.open(CustomerDialog, {
        //     width: '75vw',
        //     height: '75vh',
        //     maxWidth: '100vw',
        //     panelClass: 'full-screen-modal',
        //     data: { ...val, readonly: false }   // 👈 send readonly flag
        //   });
        //   // // ✅ Success SweetAlert
        //   // Swal.fire({
        //   //   icon: 'success',
        //   //   title: 'Updated!',
        //   //   text: 'Customer has been updated successfully.',
        //   //   showConfirmButton: false,
        //   //   timer: 1500
        //   // });
        // } catch (error) {
        //   console.error('Update failed:', error);
        //   Swal.fire({
        //     icon: 'error',
        //     title: 'Oops...',
        //     text: 'Update failed! Please try again later.'
        //   });
        // }

        this.dialog.open(CustomerDialog, {
            width: '75vw',
            height: '75vh',
            maxWidth: '100vw',
            panelClass: 'full-screen-modal',
            data: { ...val, readonly: false }   // 👈 send readonly flag
          });
      }
    });
  }

  view(val: any) {
    this.dialog.open(CustomerDialog, {
      width: '75vw',
      height: '75vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
      data: { ...val, readonly: true }   // 👈 send readonly flag
    });
  }

  Delete(key: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this record?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Call delete API
        this.http.delete(
          `https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer/${key}.json`
        ).subscribe(() => {
          // ✅ Show success alert after deletion
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Customer has been deleted successfully.',
            showConfirmButton: false,
            timer: 1500
          });

          // Optional: refresh list
          // this.ngOnInit();
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Delete failed! Please try again later.'
          });
          console.error('Delete failed:', error);
        });
      }
    });
  }


  @Input() data: any[] = [];

  // p: number = 1;               // Current page
  itemsPerPage: number = 10;   // Page size
  // searchText: string = '';     // Global search
  genderFilter: string = '';   // Column filter
  // sortColumn: string = '';
  // sortDirection: 'asc' | 'desc' = 'asc';

  // ✅ Filter + sort + paginate
  get filteredData() {
    let filtered = this.data;

    // Global search
    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }

    // Gender filter
    if (this.genderFilter) {
      filtered = filtered.filter(item => item.gender === this.genderFilter);
    }

    // Sorting
    if (this.sortColumn) {
      filtered = filtered.sort((a, b) => {
        const valA = String(a[this.sortColumn]).toLowerCase();
        const valB = String(b[this.sortColumn]).toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  // Toggle sort on column
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

}
