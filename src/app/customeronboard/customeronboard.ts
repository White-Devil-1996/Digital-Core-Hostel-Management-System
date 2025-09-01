import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Label } from '../label/label';
import { Tablegrid } from '../tablegrid/tablegrid';
// import { NgFor, NgIf } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'; // ✅ Add this
declare let pdfMake: any;


@Component({
  selector: 'app-customeronboard',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, Label,Tablegrid],
  templateUrl: './customeronboard.html',
  styleUrl: './customeronboard.scss'
})
export class Customeronboard implements OnInit {
  res: any;
  @Input() data: any[] = [];
   cards = [
    { title: 'Total Customers', value: '0' },
    { title: 'Bookings Today', value: '0' },
    { title: 'Pending Payments', value: '0' },
    { title: 'Revenue', value: '$0' }
  ];
  // p: number = 1; // ✅ Current page number
 menuLabel = 'Customer Management';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }
  async ngOnInit(): Promise<void> {

        // this.menuLabel = 'Dashboard';

  try {
    const response = await this.http
      .get<{ [key: string]: any }>('https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json')
      .toPromise();

    if (response) {
      // Convert object to array with keys included
      this.res = Object.entries(response).map(([key, value]) => ({
        key,
        ...value
      }));

      this.cards[0].value = this.res.length.toString();
      this.cards[1].value = this.res.length.toString();
      this.cards[2].value = this.res.length.toString();
      this.cards[3].value = this.res.length.toString();

      this.cdr.detectChanges();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


}
