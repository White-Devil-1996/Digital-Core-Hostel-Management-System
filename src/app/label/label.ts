import { Component,Input  } from '@angular/core';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [],
  templateUrl: './label.html',
  styleUrl: './label.scss'
})
export class Label {
@Input() text: string = '';
}
