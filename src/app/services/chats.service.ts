import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { ChatComponent } from '../pages/chat/chat.component';

@Injectable({
  providedIn: 'root',
})
export class ChatsService implements OnInit{
  constructor() {}

  private chats$: any[] = [];
  private currentChatId$: string | null = null;

  httpClient = inject(HttpClient);
  webSocketService = inject(WebSocketService);

  updateChats(callback: any){
    this.webSocketService.send("spaces:getList", (ok: boolean, err: string, res: any) => {
      if (ok) {
        this.chats$ = res.map((chat: any) => chat.spaceId);
        callback(this.chats$);
      } else {
        console.error('Error receiving chats:', err);
      }
    })
  }

  chats(callback?: (chats: any[]) => void): void | any[] {
    if (this.chats$.length > 0) {
      callback?.(this.chats$);
      return this.chats$;
    }
    if (!callback) {
      this.updateChats((chats: any[]) => {
        this.chats$ = chats;
      });
      return this.chats$;
    }
    this.updateChats(callback);
  }

  getChatById(chatId: string, callback: any): void {
    this.webSocketService.send(
      'communication:chats:getList',
      { spaceId: chatId, limit: 10000 },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res.reverse()
          callback({chat: this.chats$.find((chat: any) => chat._id === chatId), messages: data});
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
  }

  ngOnInit(): void {
    this.chats();
  }

  selectChat(chatId: string): void {
    this.currentChatId$ = chatId;
  }

  get currentChatId(): string | null {
    return this.currentChatId$;
  }

  async sendMessage(chatId: string, message: string, callback: any): Promise<void> {
    this.webSocketService.send(
      'communication:chats:create',
      {
        spaceId: chatId,
        // @ts-ignore
        text: message,
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.webSocketService.send(
            'communication:chats:close',
            { communicationId: data._id },
            callback
          );
        } else {
          console.error('Error sending message:', err);
        }
      }
    );
  }
}
