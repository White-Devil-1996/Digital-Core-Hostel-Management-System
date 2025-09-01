import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-landingscreen',
  imports: [
    RouterModule, CommonModule,MatButtonModule, MatDividerModule, MatIconModule
  ],
  templateUrl: './landingscreen.html',
  styleUrl: './landingscreen.scss'
})
export class Landingscreen {
openWhatsApp() {
throw new Error('Method not implemented.');
}
  loader: boolean = true;
  
  constructor(private router: Router) {}
 carouselImages = [
    { src: 'https://via.placeholder.com/1600x600?text=Comfort+Rooms', title: 'Comfortable Rooms', subtitle: 'Relax & Enjoy' },
    { src: 'https://via.placeholder.com/1600x600?text=Community+Space', title: 'Community Spaces', subtitle: 'Meet & Socialize' },
    { src: 'https://via.placeholder.com/1600x600?text=Gym+&+Meals', title: 'Gym & Meals', subtitle: 'Stay Healthy' }
  ];
  currentSlide = 0;

  features = [
    { icon: 'fas fa-bed', title: 'Comfort Rooms', desc: 'Spacious and modern rooms.' },
    { icon: 'fas fa-utensils', title: 'Delicious Meals', desc: 'Healthy and tasty food.' },
    { icon: 'fas fa-wifi', title: 'High-Speed WiFi', desc: 'Stay connected always.' },
    { icon: 'fas fa-dumbbell', title: 'Gym Facility', desc: 'Modern equipment for fitness.' },
    { icon: 'fas fa-shield-alt', title: '24/7 Security', desc: 'Safe and secure environment.' },
  ];

  gallery = [
    { src: 'https://via.placeholder.com/400x300?text=Offer+20%25+Off', overlay: 'Special Offer' },
    { src: 'https://via.placeholder.com/400x300?text=Furnished+Rooms', overlay: 'Fully Furnished' },
    { src: 'https://via.placeholder.com/400x300?text=Community+Events', overlay: 'Events & Meetups' },
    { src: 'https://via.placeholder.com/400x300?text=Cafeteria+Lounge', overlay: 'Cafeteria & Lounge' }
  ];

  testimonials = [
    { name: 'Rahul', feedback: 'Great place to stay! Clean rooms and friendly staff.', img: 'https://via.placeholder.com/80' },
    { name: 'Amit', feedback: 'Loved the community vibe. Highly recommend!', img: 'https://via.placeholder.com/80' },
    { name: 'Suresh', feedback: 'Affordable and comfortable. Perfect for bachelors.', img: 'https://via.placeholder.com/80' }
  ];

  pricing = [
    { plan: 'Basic', price: '₹5000/mo', details: 'Single room with basic amenities' },
    { plan: 'Standard', price: '₹7000/mo', details: 'Furnished room + meals' },
    { plan: 'Premium', price: '₹10000/mo', details: 'AC room + meals + gym access' }
  ];

  // constructor() { }

   slides: any;
  currentIndex = 0;

  ngOnInit(): void {
    this.slides = document.getElementsByClassName('carousel-slide');
    setInterval(() => { this.nextSlide(); }, 5000); // Auto-slide every 5s
  }

  nextSlide() {
    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.slides[this.currentIndex].classList.add('active');
  }

  prevSlide() {
    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.slides[this.currentIndex].classList.add('active');
  }

  bookNow() {
    alert('Booking functionality coming soon!');
  }


  routeClick(val :string){
    if(val === 'Getstarted'){
  this.router.navigate(['/Landingscreen', 'Sidenav']);

    }
    else if(val === 'CustomerOnboarding'){
      let routeUrl = '/Landingscreen/CustomerOnboarding/newCustomer';
        this.router.navigate([routeUrl]);

    }

  }
}
