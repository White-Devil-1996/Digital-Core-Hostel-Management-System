import { Component, OnDestroy, OnInit, inject, signal, ElementRef, ViewChild, ViewChildren, QueryList, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterModule, CommonModule, FormsModule
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav implements OnInit, OnDestroy {
  @ViewChild('asideRef') asideRef!: ElementRef;
  @ViewChild('asideRef1') asideRef1!: ElementRef;
  @ViewChild('asideRef2') asideRef2!: ElementRef;
  @ViewChild('asideRef3') asideRef3!: ElementRef
  @ViewChildren('asideRef4') asideRef4!: QueryList<ElementRef>;
  @ViewChildren('asideRef5') asideRef5!: QueryList<ElementRef>;

  res: any[] = [];
  dropdownOpen = false;
  searchText: string = '';
  notifications: { title: string; time: string }[] = [];
  showNotifications = false;
  constructor(private http: HttpClient, private router: Router, private renderer: Renderer2, private cdr: ChangeDetectorRef, private elementRef: ElementRef) { }
  protected fillerNav = [{ path: '', label: '', icon: '' }];
  protected fillerContent: string[] = [];
  protected readonly isMobile = signal(true);
  shouldRun = signal(true);


  private _mobileQuery?: MediaQueryList;
  private _mobileQueryListener?: () => void;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly media = inject(MediaMatcher);

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      if (isPlatformBrowser(this.platformId)) {
        this.fillerNav = []
        const storedNav = sessionStorage.getItem('fillerNav');
        try {
          const storedNav = await this.http.get<{ [key: string]: any }>('https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/menu.json').toPromise();
          if (storedNav) {
            this.res = Object.values(storedNav);
            this.cdr.detectChanges();
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        this.fillerNav = this.res ? this.res : Array.from({ length: 50 }, (_, i) => `Nav Item ${i + 1}`);
        this.fillerContent = JSON.parse(sessionStorage.getItem('fillerContent') || '[]');
      }
      this.shouldRun.set(/(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host));
      this._mobileQuery = this.media.matchMedia('(max-width: 600px)');
      this.isMobile.set(this._mobileQuery.matches);
      this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery!.matches);
      this._mobileQuery.addEventListener('change', this._mobileQueryListener);




      this.router.navigate(['Landingscreen/Sidenav/page/1']);
    }
    if (isPlatformBrowser(this.platformId)) {
      this.shouldRun.set(true);
    }


    setTimeout(() => {

      this.fillerNav.forEach((element, index) => {
        let valInd = document.getElementById('i' + index);
        if (index == 0) {
          this.renderer.addClass(valInd, 'active');
        }
        else {
          this.renderer.removeClass(valInd, 'active');
        }
      });
    });


    // Simulate live data
    setInterval(() => {
      const now = new Date().toLocaleTimeString();
      this.notifications.unshift({ title: "New message received", time: now });

      // keep only latest 10 notifications
      if (this.notifications.length > 10) {
        this.notifications.pop();
      }
    }, 10000); // new notification every 10 seconds

  }



  ngOnDestroy(): void {
    if (this._mobileQuery && this._mobileQueryListener) {
      this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
    }
  }



  burgerClick(value: string, label: string, ind: number) {
    const el = this.asideRef.nativeElement;
    const el1 = this.asideRef1.nativeElement;
    const el2 = this.asideRef2.nativeElement;
    const el3 = this.asideRef3.nativeElement;
    // const el4 = this.asideRef4.nativeElement;
    if (el.classList.contains('aside-after')) {
      this.renderer.removeClass(el, 'aside-after');
      this.renderer.removeClass(el1, 'bars1');
      this.renderer.removeClass(el2, 'bars2');
      this.renderer.removeClass(el3, 'bars3');


      this.asideRef4.forEach((item) => {
        this.renderer.addClass(item.nativeElement, 'noneclass');
        this.renderer.removeClass(item.nativeElement, 'blockclass');
      });
    } else {
      this.renderer.addClass(el, 'aside-after');
      this.renderer.addClass(el1, 'bars1');
      this.renderer.addClass(el2, 'bars2');
      this.renderer.addClass(el3, 'bars3');
      this.asideRef4.forEach((item) => {
        this.renderer.removeClass(item.nativeElement, 'noneclass');
        this.renderer.addClass(item.nativeElement, 'blockclass');
      });
    }
    if (value != '') {
      let val = 'Landingscreen/Sidenav' + value
      this.router.navigate([val]);
    }

    //   if (value) {
    //   this.router.navigate([`Landingscreen/Sidenav/${value}`], {
    //     queryParams: { label }   // ✅ send label as query param
    //   });
    // }

    this.fillerNav.forEach((element, index) => {
      let valInd = document.getElementById('i' + index);
      if (ind != -1) {
        if (index == ind) {
          this.renderer.addClass(valInd, 'active');
        }
        else {
          this.renderer.removeClass(valInd, 'active');
        }
      }
    });
  }





  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSearch() {
    if (this.searchText.trim()) {

      // 👉 Example: navigate to a search results page
      // this.router.navigate(['/search'], { queryParams: { q: this.searchText } });

      // 👉 Or trigger an event/service
      // this.searchService.search(this.searchText).subscribe(...)
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const clickedInside = this.elementRef.nativeElement.contains(event.target);
  if (!clickedInside) {
    this.showNotifications = false;
  }
}




}
