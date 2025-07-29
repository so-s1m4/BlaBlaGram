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

  deleteMessages(messages: string[]): void {
    this.webSocketService.send(
      'communication:chat:deleteMessages',
      { messages },
      (ok: any, err: any, data: any) => {
        if (!ok) {
          console.error('Failed to delete messages:', err);
          return;
        }
      }
    );
  }
  deleteMedia(mediaId: string, callback?: any): void {
    this.webSocketService.send(
      'communication:chat:deleteMedias',
      {
        media: [mediaId],
      },
      (ok: any, err: any, data: any) => {
        if (!ok) {
          console.error('Failed to delete media:', err);
          return;
        }

        callback?.();
        
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

  selectChat(chatId: string): void {
    this.currentChatId$ = chatId;
  }

  get currentChatId(): string | null {
    return this.currentChatId$;
  }

  createCommunication(
    chatId: string,
    text: string,
    callback?: (ok: any, err: any, data: any) => void
  ): void {
    this.webSocketService.send(
      'communication:chats:create',
      { spaceId: chatId, text },
      (ok: any, err: any, data: any) => {
        if (ok) {
          callback?.(ok, null, data);
        } else {
          console.error('Error creating communication:', err);
          callback?.(null, err, null);
        }
      }
    );
  }
  async sendFileToCommunication(
    file: File,
    communicationId: string,
    callback?: (ok: any, err: any, data: any) => void
  ): Promise<void> {
    let payl = new FormData();
    payl.append('file', file);
    payl.append('communicationId', communicationId);
    payl.append('type', 'file');

    this.httpClient
      .post(API_URL + '/mediaserver/media', payl, {
        headers: {
          Authorization: 'Bearer ' + this.authService.token,
        },
        reportProgress: true,
        observe: 'events',
      })
      .subscribe(
        (event) => {
          callback?.(event, null, null);
        },
        (err) => {
          console.error('Error sending file:', err);
          callback?.(false, err, null);
        }
      );
  }
  commitCommunication(
    communicationId: string,
    callback?: (ok: any, err: any, data: any) => void
  ) {
    this.webSocketService.send(
      'communication:chats:close',
      { communicationId },
      (ok: any, err: any, data: any) => {
        if (!ok) {
          console.error('Error closing communication:', err);
        }
        callback?.(ok, err, data);
      }
    );
  }

  ngOnInit(): void {
    this.chats();
  }
}
