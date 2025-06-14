import { Component, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';

@Component({
  selector: 'app-search',
  imports: [SvgIconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @Input() placeholder: string = 'Search...';
  @Output() onSearch: ((query: string) => void) | undefined;


}
