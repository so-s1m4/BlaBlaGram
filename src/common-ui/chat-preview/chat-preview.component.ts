import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-preview',
  imports: [],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css'
})
export class ChatPreviewComponent {
  @Input() chat: any;
}
