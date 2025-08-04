import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { AuthService } from './auth.service';
import { API_URL } from '../app.config';
import { NgxImageCompressService } from 'ngx-image-compress';

function base64ToBlob(base64Data: string, contentType = 'image/png'): Blob {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = Array.from({ length: slice.length }, (_, i) =>
      slice.charCodeAt(i)
    );
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
function blobToFile(blob: any, fileName: string) {
  return new File([blob], fileName, { type: blob.type });
}

@Injectable({
  providedIn: 'root',
})
export class ChatsService implements OnInit {
  constructor(private imageCompress: NgxImageCompressService) {}

  private chats$: any[] = [];
  private currentChatId$: string | null = null;

  httpClient = inject(HttpClient);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);

  toggleEmoji(communicationId: string, emojiId: string) {
    this.webSocketService.send(
      'emojis:toggle',
      {
        communicationId,
        emojiId
      },
      (ok: any, err: any, data: any) => {
        if (err) {console.error(err); return}        
      }
    );
  }

  deleteMessages(messages: string[]): void {
    this.webSocketService.send(
      'communication:chats:deleteMessages',
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
      'communication:chats:deleteMedias',
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
    this.updateChats(callback);
  }
  updateChats(callback?: any) {
    this.webSocketService.send(
      'spaces:getList',
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          this.chats$ = res.map((chat: any) => chat.spaceId);
          callback?.(this.chats$);
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
  }

  getChatById(chatId: string, callback: any): void {
    this.webSocketService.send(
      'communication:getList',
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
    repliedOn: string | null,
    callback?: (ok: any, err: any, data: any) => void
  ): void {
    this.webSocketService.send(
      'communication:chats:create',
      { spaceId: chatId, text, repliedOn },
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

    if (!file.type.startsWith('image/')) {
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

      return;
    }

    this.imageCompress
      .compressFile(URL.createObjectURL(file), 0, 70, 100) // 50% ratio, 50% quality
      .then((compressedImage: any) => {
        const blob = base64ToBlob(compressedImage);
        let newFile = blobToFile(blob, file.name);

        payl.append('file', newFile);
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
      });
  }
  commitCommunication(
    communicationId: string,
    callback?: (ok: any, err: any, data: any) => void
  ) {
    this.webSocketService.send(
      'communication:close',
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
