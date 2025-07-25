import { Component, Input } from '@angular/core';
import { API_URL } from '../../app/app.config';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  API_URL = API_URL;

  @Input() data: any;
  
}
