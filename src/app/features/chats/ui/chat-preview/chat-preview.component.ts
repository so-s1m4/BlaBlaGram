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
export class ChatPreviewComponent implements OnInit {
  @Input() chat: any;

  friendsService = inject(FriendsService);
  webSocketService = inject(WebSocketService);
  isOnline = false;

  ngOnInit(): void {
    //   if (this.chat.type == 'chat') {
    //     this.friendsService.getFriendsList((friends: any) => {
    //       if (
    //         friends.list.find((item: any) => item.id == this.chat.chat.friendId)
    //           ?.isOnline
    //       ) {
    //         this.isOnline = true;
    //       }
    //     });
    //     this.webSocketService.on('friends:friendOnline', (data: any) => {
    //       if (data.userId == this.chat.chat.friendId) {
    //         this.isOnline = true;
    //       }
    //     });
    //     this.webSocketService.on('friends:friendOffline', (data: any) => {
    //       if (data.userId == this.chat.chat.friendId) {
    //         this.isOnline = false;
    //       }
    //     });
    //   }
    // }
  }
}
