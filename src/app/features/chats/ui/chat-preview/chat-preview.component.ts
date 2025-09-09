import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ImgPipe } from '@utils/img.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { FriendsService } from '@features/friends/data/friends.service';
import { WebSocketService } from '@services/web-socket.service';

@Component({
  selector: 'app-chat-preview',
  imports: [ImgPipe, DatePipe, CommonModule],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css',
})
export class ChatPreviewComponent {
  @Input() chat: any;

  friendsService = inject(FriendsService);
  webSocketService = inject(WebSocketService);
  isOnline = false;
}
