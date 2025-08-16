import { HttpClient, HttpEventType } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from '../../../core/services/web-socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_URL } from '../../../app.config';
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
  // @ts-ignore
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

  chats$: any[] = [];
  private currentChatId$: string | null = null;

  httpClient = inject(HttpClient);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);

  toggleEmoji(communicationId: string, emojiId: string) {
    this.webSocketService.send(
      'emojis:toggle',
      {
        communicationId,
        emojiId,
      },
      (ok: any, err: any, data: any) => {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  }

  // Messages
  readMsg(spaceId: string, seqNum: number) {
    this.webSocketService.send(
      'spaces:readMessages',
      { spaceId: spaceId, messageSeq: seqNum },
      (ok: any, error: any, result: any) => {
        if (!ok) console.error('Помилка:', error);
      }
    );
  }
  editMsg(chatId: string, text: string, callback?: Function) {
    this.webSocketService.send(
      'communication:update',
      {
        communicationId: chatId,
        text: text,
      },
      (ok: any, err: any, data: any) => {
        if (err) {
          console.error('Error updating message:', err);
          return;
        }
        callback?.();
      }
    );
  }
  deleteMessages(messages: string[]): void {
    this.webSocketService.send(
      'communication:deleteMessages',
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
      'communication:deleteMedias',
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
  sendVideoMessage(chatId: string, videoBlob: Blob) {
    this.createCommunication(
      chatId,
      '',
      undefined,
      (ok: any, err: any, data: any) => {
        let payl = new FormData();

        payl.append('file', videoBlob);
        payl.append('communicationId', data.id);
        payl.append('type', 'video_message');

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
              if (event.type === HttpEventType.Response) {
                this.commitCommunication(data.id);
              }
            },
            (err) => {
              console.error('Error sending file:', err);
            }
          );

        return;
      }
    );
  }
  sendAudioMessage(chatId: string, audioBlob: Blob) {
    this.createCommunication(
      chatId,
      '',
      undefined,
      (ok: any, err: any, data: any) => {
        let payl = new FormData();

        payl.append('file', audioBlob);
        payl.append('communicationId', data.id);
        payl.append('type', 'audio');

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
              if (event.type === HttpEventType.Response) {
                this.commitCommunication(data.id);
              }
            },
            (err) => {
              console.error('Error sending file:', err);
            }
          );

        return;
      }
    );
  }
  createCommunication(
    chatId: string,
    text: string,
    repliedOn: string | undefined,
    callback?: (ok: any, err: any, data: any) => void
  ): void {
    this.webSocketService.send(
      'communication:create',
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

  // Chat data
  chats(callback?: (chats: any[]) => void): void | any[] {
    this.updateChats(callback);
  }
  getChatById(chatId: string, callback: any): void {
    this.webSocketService.send(
      'communication:getList',
      { spaceId: chatId, limit: 9999999999 },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res.reverse();
          callback({
            chat: this.chats$.find((chat: any) => chat.id == chatId),
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

  // Spaces
  createSpace(type: string, args: any) {
    if (type == "group") {
      console.log(args)
    }
  }
  deleteChat(chatId: string): void {
    this.webSocketService.send(
      'spaces:delete',
      {
        spaceId: chatId,
      },
      (ok: any, err: any, data: any) => {
        console.log(ok, err, data);
      }
    );
  }
  updateChats(callback?: any) {
    this.webSocketService.send(
      'spaces:getList',
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          this.chats$ = res;
          callback?.(this.chats$);
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
  }
  // Hooks
  ngOnInit(): void {
    this.chats();
  }
}
