import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '../loader';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})
export class LoaderComponent {
  constructor(public loaderService: Loader) {}
}
