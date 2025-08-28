import { HttpClient, HttpEventType } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from '../../../core/services/web-socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_URL, MEDIA_SERVER_URL } from '../../../app.config';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Router } from '@angular/router';
import { FriendsService } from '@features/friends/data/friends.service';

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
export class ChatsService {
  constructor(private imageCompress: NgxImageCompressService) {
    this.getChats();
    this.webSocketService.on('space:addedToNew', (data: any) => {
      this.getChats();
    });
    this.webSocketService.on('space:removedFromSpace', (data: any) => {
      this.chats$.list = this.chats$.list.filter(
        (item: any) => item.id != data.id
      );
      if (this.currentChat$.id == data.id) this.router.navigate(['/chats']);
    });
    this.webSocketService.on('communication:newMessage', (data: any) => {
      if (data.spaceId === this.currentChat$.id) {
        this.currentChat$.messages.push(data);
        this.currentChat$.lastMessage = {
          text: data.text,
          editedAt: data.editedAt,
        };
        // if (data.sender.id == this.authService.me.id)
        //   setTimeout(() => this.scrollToBottom(), 0.1);
      }
    });
    this.webSocketService.on('communication:editMessage', (data: any) => {
      if (data.spaceId === this.currentChat$.id) {
        const message = this.currentChat$.messages.find(
          (msg: any) => msg.id === data.id
        );
        if (message) {
          message.editedAt = data.editedAt;
          message.text = data.text;
        }
      }
    });
    this.webSocketService.on('communication:deleteMedia', (data: any) => {
      if (data.spaceId === this.currentChat$.id) {
        const message = this.currentChat$.messages.find(
          (msg: any) => msg.id === data.communicationId
        );
        message.media = message.media.filter(
          (media: any) => media.id !== data.id
        );
      }
    });
    this.webSocketService.on('communication:deleteMessage', (data: any) => {
      if (data.spaceId === this.currentChat$.id) {
        this.currentChat$.messages = this.currentChat$.messages.filter(
          (msg: any) => msg.id !== data.id
        );
      }
    });
  }

  private chats$: { list: any[] } = { list: [] };
  private currentChat$: any = {};

  httpClient = inject(HttpClient);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);
  friendsService = inject(FriendsService);

  router = inject(Router);

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
          .post(`${MEDIA_SERVER_URL}/media`, payl, {
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
          .post(`${MEDIA_SERVER_URL}/media`, payl, {
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
        .post(`${MEDIA_SERVER_URL}/media`, payl, {
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
          .post(MEDIA_SERVER_URL + '/media', payl, {
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
  getChatById(chatId: string, callback?: any): any {
    this.webSocketService.send(
      'communication:getList',
      { spaceId: chatId, limit: 9999999999 },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          let data = res.reverse();
          callback?.({
            chat: this.chats$.list.find((chat: any) => chat.id == chatId),
            messages: data,
          });
          return data;
        } else {
          this.router.navigate(['chats']);
          console.error('Error receiving chats:', err);
        }
      }
    );
  }
  getInfoAboutChat(chatId: string, callback?: any) {
    this.webSocketService.send(
      'spaces:getInfo',
      { spaceId: chatId },
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          this.currentChat$.info = res;
          callback(res);
        } else {
          this.router.navigate(['chats', chatId]);
          console.error('Error receiving chats:', err);
        }
      }
    );
  }
  selectChat(chatId: string): void {
    if (chatId === '') {
      this.currentChat$ = {};
      return;
    }
    this.currentChat$.id = chatId;
    this.currentChat$.data = this.chats$.list.find(
      (item: any) => item.id == chatId
    );
    this.getChatById(chatId, (data: any) => {
      this.currentChat$.data = data.chat;
      this.currentChat$.messages = data.messages;
    });
    this.currentChat$.info = {};
  }
  get currentChatId(): string | null {
    return this.currentChat$.id;
  }
  // Spaces
  createSpace(type: string, args: any) {
    if (type == 'group') {
      this.webSocketService.send(
        'spaces:group:create',
        {
          title: args.title,
          members: [...args.selected.map((item: any) => item.id)],
        },
        (ok: any, error: any, result: any) => {
          if (ok) {
          } else {
            console.error('Помилка:', error);
          }
        }
      );
    }
  }
  deleteChat(chatId: string): void {
    this.webSocketService.send(
      'spaces:delete',
      {
        spaceId: chatId,
      },
      (ok: any, err: any, data: any) => {}
    );
  }
  leaveChat(chatId: string) {
    this.webSocketService.send(
      'spaces:leave',
      {
        spaceId: chatId,
      },
      (ok: any, err: any, data: any) => {}
    );
  }
  getChats() {
    this.webSocketService.send(
      'spaces:getList',
      (ok: boolean, err: string, res: any) => {
        if (ok) {
          this.chats$.list = res;
          this.chats$.list.sort((a, b) => {
            return -(a.updatedAt as string).localeCompare(b.updatedAt);
          });
          this.chats$.list.forEach((item: any) => {
            if (item.type === 'chat') {
              item.chat.friend = this.friendsService.getFriend(
                item.chat.friendId
              );
            }
          });
        } else {
          console.error('Error receiving chats:', err);
        }
      }
    );
  }
  async patchSpace(
    type: string,
    id: any,
    payload: FormData,
    callback?: (res: any) => void
  ) {
    await this.httpClient
      .patch(API_URL + `/spaces/${id}`, payload, {
        headers: {
          Authorization: 'Bearer ' + this.authService.token,
        },
      })
      .subscribe((res: any) => {
        window.location.reload();
        callback?.(res);
      });
  }
  addMembersToSpace(
    type: string,
    spaceId: string,
    members: string[],
    callback?: Function
  ) {
    this.webSocketService.send(
      `spaces:${type}:addMembers`,
      {
        spaceId,
        members,
      },
      (ok: any, err: any, data: any) => {
        if (ok) callback?.(data);
        else console.error(err);
      }
    );
  }
  delMembersFromSpace(
    type: string,
    spaceId: string,
    members: string[],
    callback?: Function
  ) {
    this.webSocketService.send(
      `spaces:${type}:removeMembers`,
      {
        spaceId,
        members,
      },
      (ok: any, err: any, data: any) => {
        if (ok) callback?.(data);
        else console.error(err);
      }
    );
  }
  promoteMemberInSpace(spaceId: string, adminId: string, callback?: Function) {
    this.webSocketService.send(
      `spaces:addAdmin`,
      {
        spaceId,
        adminId,
      },
      (ok: any, err: any, data: any) => {
        if (ok) callback?.(data);
        else console.error(err);
      }
    );
  }
  degradeMemberInSpace(spaceId: string, adminId: string, callback?: Function) {
    this.webSocketService.send(
      `spaces:removeAdmin`,
      {
        spaceId,
        adminId,
      },
      (ok: any, err: any, data: any) => {
        if (ok) callback?.(data);
        else console.error(err);
      }
    );
  }
  // Getters
  get chats() {
    return this.chats$;
  }
  get currentChat(): any {
    return this.currentChat$;
  }
}
