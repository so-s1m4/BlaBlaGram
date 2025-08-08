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
import { FriendsService } from '@services/friends.service';
import { WebSocketService } from '@services/web-socket.service';

@Component({
  selector: 'app-chat-preview',
  imports: [ImgPipe, DatePipe, CommonModule],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.css',
})
export class ChatPreviewComponent implements OnInit {
  @Input() chat: any;

  friendsService = inject(FriendsService);
  webSocketService = inject(WebSocketService);
  isOnline = false;
  friends: { list: any[] } = {
    list: [],
  };

  ngOnInit(): void {
    this.friendsService.getFriendsList((friends: any) => {
      if (
        friends.list.find(
          (item: any) => item.id == this.chat.user1_id
        )?.isOnline ||
        friends.list.find(
          (item: any) => item.id == this.chat.user2_id
        )?.isOnline
      ) {
        this.isOnline = true;
      }
    });

    this.webSocketService.on('friends:friendOnline', (data: any) => {
      if (
        data.userId == this.chat.user1_id ||
        data.userId == this.chat.user2_id
      ) {
        this.isOnline = true;
      }
    });
    this.webSocketService.on('friends:friendOffline', (data: any) => {
      if (
        data.userId == this.chat.user1_id ||
        data.userId == this.chat.user2_id
      ) {
        this.isOnline = false;
      }
    });
  }
}
