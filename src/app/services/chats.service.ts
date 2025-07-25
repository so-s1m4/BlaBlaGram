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
        console.log(this.chats$)
        callback(this.chats$);
      } else {
        console.error('Error receiving chats:', err);
      }
    })
  }

  chats(callback: (chats: any[]) => void):void {
    if (this.chats$.length > 0) {
      callback(this.chats$);
      return;
    }
    this.updateChats(callback);
  }

  getChatById(chatId: string, callback: any): void {
    this.webSocketService.send(
      'communication:chats:getList',
      { spaceId: chatId },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res
          callback({chat: this.chats$.find((chat: any) => chat._id === chatId), messages: data});
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
