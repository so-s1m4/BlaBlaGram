import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChatPreviewComponent } from './ui/chat-preview/chat-preview.component';
import { ChatsService } from './data/chats.service';
import { ChatComponent } from './ui/chat/chat.component';
import { WebSocketService } from '../../core/services/web-socket.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chats',
  imports: [ChatPreviewComponent, ChatComponent, CommonModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit {
  window: any;

  router = inject(Router);
  aRoute = inject(ActivatedRoute);
  webSocketService = inject(WebSocketService);

  currentChat: any = null;

  private chats: any[] = [];
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
        ...item.lastMessage,
        updatedAt: new Date(item.lastMessage?.updatedAt),
      },
    }));
  }
  ngOnInit(): void {
    this.chatsService.chats(this.setChats.bind(this));
    this.aRoute.queryParamMap.subscribe((params) => {
      this.currentChat = params.get('id')?.trim();
    });
    this.webSocketService.on('space:addedToNew', (data: any) => {
      this.chatsService.chats(this.setChats.bind(this));
    });
  }

  isThisChatAtMe(chatId: string) {
    return !!this.chats.find((item) => item._id == chatId);
  }

  get getChats(): any[] {
    return this.chats;
  }
}
