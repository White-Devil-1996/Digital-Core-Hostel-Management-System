import { Component } from '@angular/core';
import { LoginForm } from "../login-form/login-form";
import { RegisterForm } from '../register-form/register-form';
import { CommonModule } from '@angular/common';
import { Loader } from '../shared/loader';

@Component({
  selector: 'app-login-module',
  imports: [LoginForm, RegisterForm, CommonModule],
  templateUrl: './login-module.html',
  styleUrl: './login-module.scss'
})
export class LoginModule {
  currentComponent: 'login' | 'register' = 'login';
  selectedColor: string = '#269af2';
   constructor(private loader: Loader) {}

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  this.loader.show();
   this.colorPicker(this.selectedColor);

    setTimeout(() => {
      this.loader.hide();
    }, 3000);
}

  colorPicker(event: any) {
  this.selectedColor = event == '#269af2' ? event : event.target?.value;
  var r = document.querySelector(':root') as HTMLElement | null;
  r?.style.setProperty('--primarycolor', this.selectedColor);

  //  const root = document.documentElement;
  //   root.style.setProperty('--primarycolor', '#42a5f5');
  //   root.style.setProperty('--secondarycolor', '#fff');
}
 
  showComponent(component: 'login' | 'register') {
    this.loader.show();
    this.currentComponent = component;
    setTimeout(() => {
      this.loader.hide();
    }, 1000);
  }


  openWhatsApp() {
  const phoneNumber = "9080148956"; // your number
  const message = "Hello, I am interested in your PG. Please share more details."; // optional
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
}
