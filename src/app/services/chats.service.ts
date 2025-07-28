import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { AuthService } from './auth.service';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ChatsService implements OnInit {
  constructor() {}

  private chats$: any[] = [];
  private currentChatId$: string | null = null;

  httpClient = inject(HttpClient);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);

  updateChats(callback: any) {
    this.webSocketService.send(
      'spaces:getList',
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          this.chats$ = res.map((chat: any) => chat.spaceId);
          callback(this.chats$);
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
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
      { spaceId: chatId, limit: 100 },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res.reverse();
          callback({
            chat: this.chats$.find((chat: any) => chat._id === chatId),
            messages: data,
          });
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

  async sendMessage(
    chatId: string,
    upload: { message: string; files: any[] },
    callback: any
  ): Promise<void> {
    this.webSocketService.send(
      'communication:chats:create',
      {
        spaceId: chatId,
        // @ts-ignore
        text: upload.message || '',
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          let filesUploaded = 0;
          if (!upload.files || upload.files.length === 0) {
            this.webSocketService.send(
              'communication:chats:close',
              { communicationId: data._id },
              callback
            );
            return;
          }

          for (const file of upload.files || []) {
            let payl = new FormData();
            payl.append('file', file);
            payl.append('communicationId', data._id);
            payl.append('type', 'file');

            this.httpClient
              .post(API_URL + '/mediaserver/media', payl, {
                headers: {
                  Authorization: 'Bearer ' + this.authService.token,
                },
              })
              .subscribe((res) => {
                console.log(res);
                filesUploaded++;
                if (filesUploaded === upload.files.length) {
                  this.webSocketService.send(
                    'communication:chats:close',
                    { communicationId: data._id },
                    callback
                  );
                }
              });
          }
        } else {
          console.error('Error sending message:', err);
        }
      }
    );
  }
}
