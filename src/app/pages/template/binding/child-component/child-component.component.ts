import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-child-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  // type input(), else it's unknown
  value = input.required<string>();
}
