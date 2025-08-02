import {
  AfterContentInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatsService } from '../../services/chats.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../utils/svg.component';
import { API_URL } from '../../app.config';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/web-socket.service';
import { LayoutComponent } from '../../../common-ui/layout/layout.component';
import { MessageComponent } from '../../../common-ui/message/message.component';
import { HttpEventType } from '@angular/common/http';
import { ContextMenuComponent } from '../../../common-ui/context-menu/context-menu.component';
import { MediaGalleryComponent } from '../../../common-ui/media-gallery/media-gallery.component';
import { ImgPipe } from '../../utils/img.pipe';
import { FriendsService } from '../../services/friends.service';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    SvgIconComponent,
    MessageComponent,
    ContextMenuComponent,
    MediaGalleryComponent,
    ImgPipe
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterContentInit
{
  API_URL = API_URL;

  URL = URL;
  constructor(private router: ActivatedRoute) {}

  layout = inject(LayoutComponent);
  chatService = inject(ChatsService);
  webSocketService = inject(WebSocketService);
  friendsService = inject(FriendsService);
  authService = inject(AuthService);
  route: Router = inject(Router);

  editMode = false;
  messageIdForEdit: string | null = null;
  messageTextForEdit: string | null = null;

  repliedOn: any = null;

  contextMenuItems: { label: string; action: Function; svg?: string }[] = [];
  contextMenuStyle: {
    top: string;
    left: string;
    display: string;
    transform?: string;
  } = { top: '0', left: '0', display: 'none' };

  me: any = this.authService.me;

  filesList: { name: string; size: number; file: File }[] = [];

  mediaToShow: any[] = [];

  isSelectMode = false;
  isOnline = false;

  private chatData$: any;
  @Input() chatId: string | undefined = '';
  @Output('closeChat') close = new EventEmitter<void>();

  // Actions
  toggleSelectMode(): void {
    this.isSelectMode = !this.isSelectMode; // Toggle select mode
  }
  openChatSettings(): void {}
  scrollToBottom(): void {
    const messagesHolder = document.getElementById('messages-holder');
    if (messagesHolder) {
      messagesHolder.scrollTo({
        top: messagesHolder.scrollHeight,
      });
    }
  }
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.editMode) {
        this.editMessage();
      } else {
        this.sendMessage();
      }
    }
  }
  toggleEditMessage(msgId: string) {
    if (this.messageIdForEdit === msgId) {
      this.messageIdForEdit = null;
      this.editMode = false;
      this.messageTextForEdit = null;
    } else {
      this.messageIdForEdit = msgId;
      this.editMode = true;
      this.messageTextForEdit = this.chatData?.messages.find(
        (msg: any) => msg._id === msgId
      ).text;
    }
  }
  // Messages
  sendMessage(): void {
    //@ts-ignore
    const message = document.getElementById('message-input')!.value;

    if (!message.trim() && this.filesList.length === 0) {
      return;
    }

    this.chatService.createCommunication(
      this.chatId!,
      message,
      this.repliedOn?._id,
      (ok, err, data) => {
        const comId = data._id;
        const files = this.filesList;
        let numberUploadedFiles = 0;

        this.filesList = [];

        if (files.length === 0) {
          this.chatService.commitCommunication(comId);
          this.scrollToBottom();
          return;
        }

        for (let file of files) {
          const uploadBar = (() => {
            const uploadBar = document.createElement('div');
            uploadBar.className = 'upload-bar';
            uploadBar.style.width = '100%';
            uploadBar.style.height = 'fit-content';
            uploadBar.style.display = 'flex';
            uploadBar.style.alignItems = 'center';
            uploadBar.style.gap = '1rem';
            uploadBar.style.padding = '1rem';
            return uploadBar;
          })();
          if (
            file.name.endsWith('.png') ||
            file.name.endsWith('.jpg') ||
            file.name.endsWith('.jpeg')
          ) {
            const img = (() => {
              let img = document.createElement('img');
              img.className = 'imgForUploadBar';
              img.style.width = '5vh';
              img.style.height = '5vh';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '8px';
              img.style.border = '1px solid var(--primary-color)';

              img.src = URL.createObjectURL(file.file);
              return img;
            })();
            uploadBar.appendChild(img);
          } else {
            const svg = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'svg'
            );
            svg.classList.add('file-icon');
            svg.style.width = '5vh';
            svg.style.height = '5vh';
            svg.style.color = 'var(--primary-color)';

            const use = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'use'
            );
            use.setAttributeNS(
              'http://www.w3.org/1999/xlink',
              'xlink:href',
              '/assets/svg/file.svg#file'
            );
            svg.appendChild(use);

            uploadBar.appendChild(svg);
          }

          const line = document.createElement('div');
          line.className = 'line';
          line.style.width = '2%';
          line.style.height = '5px';
          line.style.backgroundColor = 'var(--primary-color)';
          line.style.borderRadius = '8px';

          uploadBar.appendChild(line);

          document.getElementById('upload-bars-holder')?.appendChild(uploadBar);
          this.chatService.sendFileToCommunication(
            file.file,
            comId,
            (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                if (event.total) {
                  const percentDone = Math.round(
                    (100 * event.loaded) / event.total
                  );
                  line.style.width = percentDone + '%';
                }
              } else if (event.type === HttpEventType.Response) {
                numberUploadedFiles++;

                setTimeout(() => {
                  uploadBar.remove();
                }, 100);

                if (numberUploadedFiles === files.length) {
                  this.chatService.commitCommunication(comId);
                  this.scrollToBottom();
                }
              }
            }
          );
        }
      }
    );
    this.repliedOn = null;
    //@ts-ignore
    document.getElementById('message-input').value = '';
  }
  deleteSelectedMessages($event: Event) {
    $event.stopPropagation();

    let messagesToDelete = this.chatData$.messages
      .map((msg: any) => {
        if (msg.isSelected) {
          return msg._id;
        }
      })
      .filter((id: any) => id);

    this.chatService.deleteMessages(messagesToDelete);
  }
  editMessage() {
    const inputElement = document.getElementById(
      'message-input'
    ) as HTMLInputElement;
    const text = inputElement.value;

    if (text.length == 0) {
      this.toggleEditMessage(this.messageIdForEdit!);
    }
    if (inputElement) {
      this.webSocketService.send(
        'communication:chats:update',
        {
          communicationId: this.messageIdForEdit,
          text,
        },
        (ok: any, err: any, data: any) => {
          if (err) {
            console.error('Error updating message:', err);
            return;
          }
          const msg = this.chatData$.messages.find(
            (msg: any) => msg._id === this.messageIdForEdit
          );
          if (msg) {
            msg.text = text;
            msg.editedAt = new Date().toISOString();
          }
          this.toggleEditMessage(this.messageIdForEdit!);
        }
      );
    }
  }
  replyOn(id: string){
    if (id==="") {
      this.repliedOn = null;
      return
    }
    this.repliedOn = this.chatData$.messages.find((item: any)=>item._id == id)
  }
  // Media
  openMedia(comId: string): void {
    const msg = this.chatData$.messages.find((msg: any) => msg._id === comId);
    const media = msg?.media || [];
    this.mediaToShow = media;
    this.closeContextMenu();
  }
  closeMedia(): void {
    this.mediaToShow = [];
  }
  deleteMedia(data: { comId: string; mediaId: string }): void {
    this.chatService.deleteMedia(data.mediaId, () => {
      let msg = this.chatData$.messages.find(
        (msg: any) => msg._id === data.comId
      );
      if (!msg) {
        return;
      }
      msg.media = msg.media.filter((media: any) => media._id !== data.mediaId);
    });
  }
  // Files
  deleteFile(file: any): void {
    this.filesList = this.filesList.filter((f) => f !== file);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      let newFiles = files.map((file) => ({
        name: file.name,
        size: file.size,
        file: file,
      }));
      this.filesList.push(...newFiles);
      this.filesList = this.filesList.slice(0, 10); // Limit to 10 files
    }
  }
  goBack(): void {
    this.close.emit();
  }
  // Chat data
  setChatData(chatData: any): void {
    this.me = this.authService.me;
    this.chatData$ = chatData;
    this.scrollToBottom();

    this.friendsService.getFriendsList((friends: any) => {
      if (
        friends.list.find(
          (item: any) => item.id == this.chatData$.chat.user1_id
        )?.isOnline ||
        friends.list.find(
          (item: any) => item.id == this.chatData$.chat.user2_id
        )?.isOnline
      ) {
        this.isOnline = true;
      }
    });
    this.webSocketService.on('friends:friendOnline', (data: any) => {
      if (
        data.userId == this.chatData$.chat.user1_id ||
        data.userId == this.chatData$.chat.user2_id
      ) {
        this.isOnline = true;
      }
    });
    this.webSocketService.on('friends:friendOffline', (data: any) => {
      if (
        data.userId == this.chatData$.chat.user1_id ||
        data.userId == this.chatData$.chat.user2_id
      ) {
        this.isOnline = false;
      }
    });
  }
  loadChat() {
    if (!this.chatId) {
      return;
    }
    this.chatService.selectChat(this.chatId!);
    this.chatService.getChatById(this.chatId, this.setChatData.bind(this));
  }
  // Event handlers
  onNewMessage(data: any): boolean {
    if (data.spaceId !== this.chatId) {
      return false;
    }
    this.chatData$.messages.push(data);
    setTimeout(() => this.scrollToBottom(), 0.1);
    return true;
  }
  closeContextMenu() {
    this.contextMenuStyle.display = 'none';
  }
  openContextMenu(data: {
    currentTarget: any;
    clientX: number;
    clientY: number;
  }): void {
    const targetData: { type: string; id: string; my: boolean; path?: string } =
      JSON.parse(
        (data.currentTarget as HTMLElement).getAttribute('data') as string
      ) as any;
    if (!targetData) {
      return;
    }
    const scrollableElement = document.getElementById('messages-holder')!;

    const scrollRect = scrollableElement.getBoundingClientRect();
    const x = data.clientX - scrollRect.left + scrollableElement.scrollLeft;
    const y = data.clientY - scrollRect.top + scrollableElement.scrollTop;

    this.contextMenuStyle = {
      display: 'flex',
      left: x + 'px',
      top: y + 'px',
    };
    if (x / (scrollRect.right - scrollRect.left) > 0.5) {
      this.contextMenuStyle.transform = 'translateX(-100%)';
    }
    if (targetData.type === 'message') {
      this.contextMenuItems = [
        {
          label: 'Reply',
          svg: 'reply',
          action: () => {
            this.replyOn(targetData.id);
            this.closeContextMenu();
          },
        },
      ];

      if (targetData.my) {
        this.contextMenuItems.push(
          ...[
            {
              label: 'Edit',
              svg: 'pen',
              action: () => {
                this.toggleEditMessage(targetData.id);
                this.closeContextMenu();
              },
            },
            {
              label: 'Delete',
              svg: 'trashcan',
              action: () => {
                this.closeContextMenu();
                this.chatService.deleteMessages([targetData.id]);
              },
            },
          ]
        );
      } else {
        this.contextMenuItems.push(...[
          {
            label: 'Delete',
            svg: 'trashcan',
            action: () => {
              this.closeContextMenu();
              this.chatService.deleteMessages([targetData.id]);
            },
          },
        ]);
      }
    } else if (targetData.type === 'media') {
      this.contextMenuItems.push(
        ...[
          {
            label: 'Download',
            svg: 'download',
            action: () => {
              window.location.href =
                API_URL + '/mediaserver/public/' + targetData.path;
              this.closeContextMenu();
            },
          },
          {
            label: 'Delete',
            svg: 'trashcan',
            action: () => {
              this.closeContextMenu();
              this.chatService.deleteMedia(targetData.id);
            },
          },
        ]
      );
    }

    if (!targetData) {
      return;
    }
  }
  // Lifecycle hooks
  ngOnInit(): void {
    this.loadChat();
    this.webSocketService.on('communication:newMessage', (data: any) => {
      this.onNewMessage(data);
    });
    this.webSocketService.on('communication:editMessage', (data: any) => {
      if (data.spaceId === this.chatId) {
        const message = this.chatData$.messages.find(
          (msg: any) => msg._id === data._id
        );
        if (message) {
          message.editedAt = data.editedAt;
          message.text = data.text;
        }
      }
    });
    this.webSocketService.on('communication:deleteMedia', (data: any) => {
      if (data.communicationId.spaceId === this.chatId) {
        const message = this.chatData$.messages.find(
          (msg: any) => msg._id === data.communicationId._id
        );
        message.media = message.media.filter(
          (media: any) => media._id !== data._id
        );
      }
    });
    this.webSocketService.on('communication:deleteMessage', (data: any) => {
      if (data.spaceId === this.chatId) {
        this.chatData$ = 
        {
          ...this.chatData$,
          messages: this.chatData$.messages.filter(
          (msg: any) => msg._id !== data._id
        )};
      }
    });
  }
  ngOnChanges(): void {
    this.filesList = [];
    this.chatData$ = null;
    this.loadChat();
  }
  ngOnDestroy(): void {
    this.filesList = [];
    this.chatService.selectChat('');
  }
  ngAfterContentInit(): void {
    this.scrollToBottom();
  }
  get chatData(): any {
    return this.chatData$;
  }
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
