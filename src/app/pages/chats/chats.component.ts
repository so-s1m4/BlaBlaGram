import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChatPreviewComponent } from '../../../common-ui/chat-preview/chat-preview.component';
import { ChatsService } from '../../services/chats.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-chats',
  imports: [ChatPreviewComponent, ChatComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit {
  window: any;
  constructor() {
    this.chats = [];
  }
  router = inject(Router);
  aRoute = inject(ActivatedRoute);

  currentChat: any = null;

  private chats: any[];
  chatsService = inject(ChatsService);

  selectChat(chat: any) {
    this.currentChat = chat._id;

    this.router.navigate(['chats'], {
      queryParams: { id: this.currentChat },
    });
  }
  closeChat() {
    this.currentChat = null;
    this.router.navigate(['chats']);
  }
  setChats(chats: any[]) {
    this.chats = chats.map((item) => ({
      ...item,
      lastMessage: {
        ...item.lastMessage[0],
        updatedAt: new Date(item.lastMessage[0].updatedAt),
      },
    }));
  }
  ngOnInit(): void {
    this.chatsService.chats(this.setChats.bind(this));

    this.aRoute.queryParamMap.subscribe((params) => {
      this.currentChat = params.get('id')?.trim();
    });
  }
  get getChats(): any[] {
    return this.chats;
  }
}
