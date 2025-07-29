import { Component, Input } from '@angular/core';
import { ImgPipe } from "../../app/utils/img.pipe";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-chat-preview',
  imports: [ImgPipe, DatePipe],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css'
})
export class ChatPreviewComponent {
  @Input() chat: any;
}
