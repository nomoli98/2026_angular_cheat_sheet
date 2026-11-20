import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-child-component',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './child-component.component.html',
    styleUrl: '../output.component.css',
})
export class ChildComponentComponent {
    outputValue = output<string>();

    onClick() {
        this.outputValue.emit('Boom!🧨💥💥');
    }
}
