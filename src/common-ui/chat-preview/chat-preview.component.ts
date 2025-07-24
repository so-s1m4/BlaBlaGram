import { Component, Input } from '@angular/core';
import { API_URL } from "../../app/app.config";


@Component({
  selector: 'app-chat-preview',
  imports: [],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css'
})
export class ChatPreviewComponent {
  API_URL = API_URL;

  @Input() chat: any;
}
