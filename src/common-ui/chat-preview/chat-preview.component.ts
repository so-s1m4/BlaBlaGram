import { Component, Input } from '@angular/core';
import { ImgPipe } from "../../app/utils/img.pipe";


@Component({
  selector: 'app-chat-preview',
  imports: [ImgPipe],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css'
})
export class ChatPreviewComponent {
  @Input() chat: any;
}
