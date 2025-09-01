import { Component } from '@angular/core';
import { routes } from '../app.routes';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {
  constructor(private http: HttpClient, private router: Router) { }

  loginForms = new FormGroup({
    Username: new FormControl('', Validators.required),
    Password: new FormControl('', Validators.required),
  });

  async loginForm(value: string) {
    if (value === 'Login') {
      if (this.loginForms.invalid) {
        this.loginForms.markAllAsTouched();
        return;
      }
      let inputMap = {
        ...this.loginForms.value
      };

      try {
        const response = await this.http.get('https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/data.json', { headers: { 'Content-Type': 'application/json' } }).toPromise();
        if (this.deepEqual(response, inputMap)) {
          this.router.navigate(['Landingscreen']);

        } else {
          // Swal.fire({
          //   icon: "error",
          //   title: "Oops...",
          //   text: "Incorrect credentials!",
          //   footer: '<a href="#">Why do I have this issue?</a>'
          // });
        }
      } catch (error) {
        console.error('HTTP Error:', error);
      }
    }

  }

  deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null)
      return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  }

}
