import { Component, OnInit, ChangeDetectorRef, Input , Inject, PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Label } from '../label/label';
import { NgFor, NgIf } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'; // ✅ Add this
import { ActivatedRoute } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { Card } from '../card/card';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, NgFor, NgIf, NgxPaginationModule, Label,Card],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  menuLabel = 'Dashboard';
  @Input() text: string = '';
  @Input() customersData: any[] = [];

  occupied = 80;
  vacant = 20;
  pieChartLabels = ['Occupied', 'Vacant'];
  

  customers: any[] = [];
  p: number = 1; // ✅ Current page number

  // Chart Data
  chartData = {
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    datasets: [
      {
        label: 'Hostel Revenue',
        data: [1000, 1500, 1300, 1800, 2200, 2500, 2700, 3000, 2800, 3200, 3500, 4000],
        borderColor: 'blue',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Cafeteria Revenue',
        data: [800, 1200, 1100, 1400, 2000, 2300, 2400, 2600, 2500, 2700, 3000, 3300],
        borderColor: 'green',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Expenses',
        data: [600, 700, 900, 1000, 1200, 1300, 1500, 1600, 1700, 1900, 2000, 2100],
        borderColor: 'red',
        borderDash: [5, 5], // dashed line
        fill: false,
        tension: 0.3
      }
    ]
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 500
        }
      }
    }
  };

 piechartarr = ['Overall Occupancy', 'Two Sharing', 'Three Sharing', 'Four Sharing'];

  // ✅ Store dynamic chart data
  pieCharts: { label: string; data: ChartData<'pie'> }[] = [];

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 14,
            weight: 'bold',
          }
        }
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw as number;
            const total = (tooltipItem.chart.data.datasets[0].data as number[])
              .reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${tooltipItem.label}: ${value} beds (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    }
  };


  // menuLabel: string | undefined;

  isBrowser = false;   // ✅ Flag to check if running in browser

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object   // ✅ Inject platform id
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);  // ✅ Check browser only
  }

  async ngOnInit(): Promise<void> {
    this.piechartarr = ['Overall Occupancy','Two Sharing','Three Sharing','Four Sharing'];
    // this.menuLabel = 'Dashboard';

    //   this.route.paramMap.subscribe(params => {
    //   const id = params.get('id');        // from value
    //   const label = params.get('label');  // from label
    // });


    try {
      const res = await this.http
        .get<{ [key: string]: any }>(
          'https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json'
        )
        .toPromise();

      if (res) {
        this.customers = Object.entries(res).map(([key, value]) => ({
          key,
          ...value
        }));


        // Total beds (example: 100)
        // const totalBeds = 100;
        // this.occupied = this.customers.length;
        // this.vacant = totalBeds - this.occupied;

        //    this.pieChartDatasets[0].data = [this.occupied, this.vacant];


         // Example: total beds (can come from API or config)
        const totalBeds = 120;
        const occupied = this.customers.length;
        const vacant = totalBeds - occupied;

        // ✅ Generate dynamic pie charts
        this.pieCharts = this.piechartarr.map((title, idx) => {
          const colors = this.getDynamicColors(idx); // get dynamic colors
          return {
            label: title,
            data: {
              labels: ['Occupied', 'Vacant'],
              datasets: [
                {
                  data: [occupied - idx * 5, vacant + idx * 5], // fake distribution per chart
                  backgroundColor: colors,
                  borderColor: '#fff',
                  borderWidth: 1,
                  hoverOffset: 15,
                  hoverBorderColor: '#000',
                }
              ]
            }
          };
        });




        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('API fetch error:', err);
    }
  }



    getDynamicColors(index: number): string[] {
    const colorPalettes = [
      ['#4CAF50', '#FF5252'], // green / red
      ['#2196F3', '#FFC107'], // blue / yellow
      ['#9C27B0', '#FF9800'], // purple / orange
      ['#00BCD4', '#E91E63'], // cyan / pink
    ];
    return colorPalettes[index % colorPalettes.length];
  }
}
