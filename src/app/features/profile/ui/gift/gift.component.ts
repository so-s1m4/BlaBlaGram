import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';

@Component({
  selector: 'app-gift',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './gift.component.html',
  styleUrl: './gift.component.css',
})
export class GiftComponent {
  @Input() data: any;
  showed = false;
  open() {
    this.showed = true;
  }
  close() {
    this.showed = false;
  }
  stopPropagation(event: Event){
    event.stopPropagation()
  }
}
