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

@Component({
  selector: 'app-chat',
  imports: [CommonModule, SvgIconComponent, MessageComponent],
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
  authService = inject(AuthService);
  route: Router = inject(Router);

  me: any = this.authService.me;

  filesList: { name: string; size: number; file: File }[] = [];
  isSelectMode = false;

  private chatData$: any;
  @Input() chatId: string | undefined = '';
  @Output('closeChat') close = new EventEmitter<void>();

  // Actions

  toggleSelectMode(): void {
    this.isSelectMode = !this.isSelectMode; // Toggle select mode
  }
  openChatSettings(): void {}

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

  scrollToBottom(): void {
    const messagesHolder = document.getElementById('messages-holder');
    if (messagesHolder) {
      messagesHolder.scrollTo({
        top: messagesHolder.scrollHeight,
      });
    }
  }
  sendMessage(): void {
    //@ts-ignore
    const message = document.getElementById('message-input')!.value;

    this.chatService.createCommunication(
      this.chatId!,
      message,
      (ok, err, data) => {
        const comId = data._id;
        const files = this.filesList;
        let numberUploadedFiles = 0;

        this.filesList = [];

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
                console.log(event.loaded, event.total);
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
    //@ts-ignore
    document.getElementById('message-input').value = '';
  }
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  // Media
  openMedia(comId: string): void {
    let mediaList =
      this.chatData$.messages
        .find((msg: any) => msg._id === comId)
        ?.media.filter((item: any) => item.mime.startsWith('image/')) || [];
    if (mediaList.length === 0) {
      return;
    }
    const wrapper = (() => {
      let wrapper = document.createElement('div');
      wrapper.className = 'media-wrapper';

      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '100dvw';
      wrapper.style.height = '100dvh';
      wrapper.style.zIndex = '1000';

      wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      wrapper.style.display = 'flex';
      wrapper.style.gap = '2rem';
      wrapper.style.justifyContent = 'flex-start';
      wrapper.style.alignItems = 'center';
      wrapper.style.overflow = 'auto';
      wrapper.style.padding = '3rem';
      return wrapper;
    })();
    const closeButton = (() => {
      let closeButton = document.createElement('button');
      closeButton.textContent = 'X';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.fontSize = '2.5rem';
      closeButton.style.color = 'var(--primary-color)';
      closeButton.style.border = 'none';
      closeButton.style.cursor = 'pointer';

      closeButton.style.position = 'fixed';
      closeButton.style.top = '25px';
      closeButton.style.right = '25px';
      closeButton.style.zIndex = '1001';
      closeButton.onclick = () => {
        document.body.removeChild(wrapper);
      };
      return closeButton;
    })();
    wrapper.appendChild(closeButton);

    mediaList.forEach((media: any) => {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.style.position = 'relative';
      mediaWrapper.style.width = 'fit-content';
      mediaWrapper.style.maxHeight = '80vh';

      const mediaElement = document.createElement('img');
      mediaElement.src = API_URL + '/mediaserver/public/' + media.path;

      mediaElement.style.borderRadius = '10px';
      mediaElement.style.maxWidth = '80vw';
      mediaElement.style.height = 'auto';

      mediaElement.style.maxHeight = '80vh';

      mediaElement.style.objectFit = 'cover';

      mediaElement.onclick = () => {
        window.open(mediaElement.src, '_blank');
      };

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.style.position = 'absolute';
      deleteButton.style.bottom = '10px';
      deleteButton.style.right = '10px';
      deleteButton.style.zIndex = '1001';
      deleteButton.style.backgroundColor = 'red';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '5px 10px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.borderRadius = '5px';
      deleteButton.onmouseover = () => {
        deleteButton.style.backgroundColor = 'white';
        deleteButton.style.color = 'red';
      };
      deleteButton.onmouseout = () => {
        deleteButton.style.backgroundColor = 'red';
        deleteButton.style.color = 'white';
      };

      deleteButton.onclick = () => {
        this.deleteMedia(comId, media._id);

        mediaList = mediaList.filter((item: any) => item._id !== media._id);
        mediaWrapper.remove();
        if (mediaList.length === 0) {
          document.body.removeChild(wrapper);
        }
      };

      mediaWrapper.appendChild(mediaElement);
      mediaWrapper.appendChild(deleteButton);

      wrapper.appendChild(mediaWrapper);
    });

    document.body.appendChild(wrapper);
  }
  deleteMedia(comId: string, mediaId: string): void {
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
        let msg = this.chatData$.messages.find((msg: any) => msg._id === comId);
        if (!msg) {
          return;
        }
        msg.media = msg.media.filter((media: any) => media._id !== mediaId);
      }
    );
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
        this.chatData$.messages = this.chatData$.messages.filter(
          (msg: any) => msg._id !== data._id
        );
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
