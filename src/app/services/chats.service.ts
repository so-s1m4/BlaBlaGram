import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  constructor() {}

  private chats$: any[] = [];


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

  chats(callback: (chats: any[]) => void):void {
    this.updateChats(callback);
  }

  getChatById(chatId: string, callback: any): void {
    this.webSocketService.send(
      'communication:chats:getList',
      { spaceId: chatId },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res
          callback(data);
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
  }

  async sendMessage(username: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      console.log(`Message sent to chat ${username}: ${message}`);
      resolve();
    });
  }
}
