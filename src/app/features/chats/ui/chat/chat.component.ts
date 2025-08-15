import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatsService } from '@features/chats/data/chats.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@utils/svg.component';
import { API_URL } from 'app/app.config';
import { AuthService } from '@services/auth.service';
import { WebSocketService } from '@services/web-socket.service';
import { LayoutComponent } from '@features/layout/layout.component';
import { MessageComponent } from '../message/message.component';
import { HttpEventType } from '@angular/common/http';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { ImgPipe } from '@utils/img.pipe';
import { FriendsService } from '@features/friends/data/friends.service';
import { EmojiSelectorComponent } from '../emoji-selector/emoji-selector.component';
import { VideoMessageComponent } from '../video-message/video-message.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { max, reduce } from 'rxjs';
import { Modal } from "@shared/common-ui/modal/modal";
import { ProfileComponent } from "@features/profile/profile.component";

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    SvgIconComponent,
    MessageComponent,
    ContextMenuComponent,
    MediaGalleryComponent,
    ImgPipe,
    EmojiSelectorComponent,
    VideoMessageComponent,
    InputFieldComponent,
    Modal,
    ProfileComponent,
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

  contextMenuItems: { label: string; action: Function; svg?: string }[] = [];
  contextMenuStyle: {
    top: string;
    left: string;
    display: string;
    transform?: string;
  } = { top: '0', left: '0', display: 'none' };
  emojiSelectorStyle: {
    top: string;
    left: string;
    display: string;
    transform?: string;
  } = { top: '0', left: '0', display: 'none' };
  msgIdOverCM: string = '';

  me: any = this.authService.me;

  mediaToShow: any[] = [];

  isSelectMode = false;
  isOnline = false;
  isRecordVM = false;
  isChatsSettings = false;
  showInfo = false;

  readMsgTimeout: any;
  maxSeq: any;

  private chatData$: any;
  @Input() chatId: string | undefined = '';
  @Output('closeChat') close = new EventEmitter<void>();
  @ViewChild(VideoMessageComponent)
  videoComp?: VideoMessageComponent;
  @ViewChild(InputFieldComponent) inputComp?: InputFieldComponent;

  // Actions
  toggleSelectMode(): void {
    this.isSelectMode = !this.isSelectMode; // Toggle select mode
  }
  toggleChatsSettigns(): void {
    this.isChatsSettings = !this.isChatsSettings;
  }
  toggleInfo(){
    this.showInfo = !this.showInfo
  }
  scrollToBottom(): void {
    const messagesHolder = document.getElementById('messages-holder');
    if (messagesHolder) {
      messagesHolder.scrollTo({
        top: messagesHolder.scrollHeight,
      });
    }
  }
  scrollToMsg(msgId: string) {
    const element = document.getElementById(msgId) as HTMLElement;
    element.classList.add('flash-highlight');
    setTimeout(() => element.classList.remove('flash-highlight'), 1500);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onStopRecord(videoDataBLOB: Blob) {
    this.chatService.sendVideoMessage(this.chatData$.chat.id, videoDataBLOB);
  }
  async toggleRecVideoMsg() {
    if (this.isRecordVM) {
      this.videoComp?.stop();
      setTimeout(() => {
        this.isRecordVM = false;
      }, 1000);
      return;
    }
    this.isRecordVM = true;
  }
  closeContextMenu() {
    this.contextMenuStyle.display = 'none';
    this.emojiSelectorStyle.display = 'none';
    this.isChatsSettings = false;
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

    this.msgIdOverCM = data.currentTarget.getAttribute('msg-id');

    const elem = data.currentTarget.getBoundingClientRect();
    if (data.currentTarget.classList.contains('sender')) {
      this.emojiSelectorStyle = {
        display: 'flex',
        left: elem.left - scrollRect.left + 'px',
        top: elem.top + scrollableElement.scrollTop - scrollRect.top + 'px',
      };
    } else {
      this.emojiSelectorStyle = {
        display: 'flex',
        // @ts-ignore
        right: scrollRect.right - elem.right + 'px',
        top: elem.top + scrollableElement.scrollTop - scrollRect.top + 'px',
      };
    }

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
                this.inputComp?.toggleEditMessage(targetData.id);
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
        this.contextMenuItems.push(
          ...[
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
      }
    } else if (targetData.type === 'media') {
      this.contextMenuItems = [];
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
  // Messages
  sendMessage(): void {
    if (!this.inputComp) return;

    const message = this.inputComp.value;

    if (!message.trim() && this.inputComp.filesList.length === 0) {
      return;
    }

    this.chatService.createCommunication(
      this.chatId!,
      message,
      this.inputComp?.repliedOn?.id,
      (ok, err, data) => {
        const comId = data.id;
        const files = this.inputComp!.filesList;
        let numberUploadedFiles = 0;

        this.inputComp!.filesList = [];

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
    this.inputComp.repliedOn = null;
    //@ts-ignore
    this.inputComp.clearInputField();
  }
  deleteSelectedMessages($event: Event) {
    $event.stopPropagation();

    let messagesToDelete = this.chatData$.messages
      .map((msg: any) => {
        if (msg.isSelected) {
          return msg.id;
        }
      })
      .filter((id: any) => id);

    this.chatService.deleteMessages(messagesToDelete);
  }
  replyOn(id: string) {
    if (!this.inputComp) return;
    if (id === '') {
      this.inputComp.repliedOn = null;
      return;
    }
    this.inputComp.repliedOn = this.chatData$.messages.find(
      (item: any) => item.id == id
    );
  }
  toggleEmoji(emjId: string) {
    this.chatService.toggleEmoji(this.msgIdOverCM, emjId);
  }
  OnReadMsg(seqNum: number) {
    if (seqNum < this.maxSeq) return;
    clearTimeout(this.readMsgTimeout);

    this.maxSeq = seqNum;
    this.readMsgTimeout = setTimeout(() => {
      this.chatService.readMsg(this.chatData.chat.id, this.maxSeq);
    }, 500);
  }
  // Media
  openMedia(comId: string): void {
    const msg = this.chatData$.messages.find((msg: any) => msg.id === comId);
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
        (msg: any) => msg.id === data.comId
      );
      if (!msg) {
        return;
      }
      msg.media = msg.media.filter((media: any) => media.id !== data.mediaId);
    });
  }
  // File
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
          (item: any) => item.id == this.chatData$.chat.chat.friendId
        )?.isOnline
      ) {
        this.isOnline = true;
      } else {
        this.isOnline = false;
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
    this.chatService.getChatById(this.chatId, (data: any) =>
      this.setChatData(data)
    );
  }
  deleteChat() {
    this.chatService.deleteChat(this.chatId!);
  }
  // Event handlers
  onNewMessage(data: any): boolean {
    if (data.spaceId !== this.chatId) {
      return false;
    }
    this.chatData$.messages.push(data);
    const chat = this.chatService.chats$.find(
      (item: any) => item.id == this.chatId
    );
    chat.lastMessage = {
      text: data.text,
      editedAt: data.editedAt,
    };
    if (data.sender.id == this.authService.me.id || true)
      setTimeout(() => this.scrollToBottom(), 0.1);
    return true;
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
          (msg: any) => msg.id === data.id
        );
        if (message) {
          message.editedAt = data.editedAt;
          message.text = data.text;
        }
      }
    });
    this.webSocketService.on('communication:deleteMedia', (data: any) => {
      if (data.spaceId === this.chatId) {
        const message = this.chatData$.messages.find(
          (msg: any) => msg.id === data.communicationId
        );
        message.media = message.media.filter(
          (media: any) => media.id !== data.id
        );
      }
    });
    this.webSocketService.on('communication:deleteMessage', (data: any) => {
      if (data.spaceId === this.chatId) {
        this.chatData$ = {
          ...this.chatData$,
          messages: this.chatData$.messages.filter(
            (msg: any) => msg.id !== data.id
          ),
        };
      }
    });
  }
  ngOnChanges(): void {
    if (this.inputComp) this.inputComp.filesList = [];
    this.chatData$ = null;
    this.loadChat();
  }
  ngOnDestroy(): void {
    if (this.inputComp) this.inputComp.filesList = [];
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
