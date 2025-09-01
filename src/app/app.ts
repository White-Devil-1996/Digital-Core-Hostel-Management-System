import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { LoaderComponent } from './shared/loader/loader';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule,LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
   protected readonly title = signal('Angular_App');
  private readonly platformId = inject(PLATFORM_ID);


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      let fillerNav = Array.from({ length: 9 }, (_, i) => ({
        label: `Nav Item ${i + 1}`,
        path: `/page/${i + 1}`
      }));
      let fillerContent = Array.from({ length: 50 }, (_, i) => `Lorem ipsum ...${i + 1}`);
      sessionStorage.setItem('fillerNav', JSON.stringify(fillerNav));
      sessionStorage.setItem('fillerContent', JSON.stringify(fillerContent));
    }
  }

}
