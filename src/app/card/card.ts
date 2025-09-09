import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  @Input() customersData: any[] = [];
  cards = [
    { title: 'Total Customers', value: '0' },
    { title: 'Bookings Today', value: '0' },
    { title: 'Overall Bed Occupancy', value: '0' },
    { title: 'Revenue', value: '$0' }
  ];
  customers: any[] = [];
  constructor() {
    // Initialize card values
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.cards[0].value = this.customersData.length.toString();
    this.cards[1].value = this.customersData.filter(c => c.bookedToday).length.toString();
    this.cards[2].value = this.customersData.filter(c => c.bed_number).length.toString();
    this.cards[3].value = this.customersData.reduce((acc, c) => acc + c.rent_paid_so_for, 0).toString();
  }

}
