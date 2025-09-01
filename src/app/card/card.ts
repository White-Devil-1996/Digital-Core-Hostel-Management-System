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
    { title: 'Pending Payments', value: '0' },
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
  }

}
