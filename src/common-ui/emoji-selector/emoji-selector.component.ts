import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emoji-selector',
  imports: [SvgIconComponent, CommonModule],
  templateUrl: './emoji-selector.component.html',
  styleUrl: './emoji-selector.component.css',
})
export class EmojiSelectorComponent {
  @Input() style: any = {};
}
