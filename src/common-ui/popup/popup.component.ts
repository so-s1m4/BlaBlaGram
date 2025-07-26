import { Component, Input } from '@angular/core';
import { ImgPipe } from "../../app/utils/img.pipe";

@Component({
  selector: 'app-popup',
  imports: [ImgPipe],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  @Input() data: any;
}
