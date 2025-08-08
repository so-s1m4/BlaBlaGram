import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';

@Component({
  selector: 'app-search',
  imports: [SvgIconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @Input() placeholder: string = 'Search...';
  @Output() search = new EventEmitter();

  onKeyPress($event: KeyboardEvent){
    if ($event.key === "Enter"){
      this.onClick()
    }
  }
  onClick() {
    const element = (document.getElementById("input-search") as HTMLInputElement);
    this.search.emit(element.value)
  }
}
