import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input} from '@angular/core';
import {Block} from '@commonUI/block/block';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, Block],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal{

  @HostBinding('style') @Input() style: any;
  @Input() showBackdrop: boolean = true;
}
