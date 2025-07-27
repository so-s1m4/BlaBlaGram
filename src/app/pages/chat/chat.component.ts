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
  private chatData$: any;

  @Input() chatId: string | undefined = '';
  @Output('closeChat') close = new EventEmitter<void>();

  scrollToBottom(): void {
    const messagesHolder = document.getElementById('messages-holder');
    if (messagesHolder) {
      messagesHolder.scrollTo({
        top: messagesHolder.scrollHeight,
      });
    }
  }
  sendMessage(): void {
    this.chatService.sendMessage(
      this.chatId!,
      {
        //@ts-ignore
        message: document.getElementById('message-input')!.value || undefined,
        //@ts-ignore
        files: this.filesList.map((file) => file.file) || [],
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.scrollToBottom();
        }
      }
    );

    this.filesList = [];
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
    const wrapper = document.createElement('div');
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

    const closeButton = document.createElement('button');
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
    wrapper.appendChild(closeButton);

    mediaList.forEach((media: any) => {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.style.position = 'relative';
      mediaWrapper.style.width = 'fit-content';
      mediaWrapper.style.maxHeight = '80vh';

      const mediaElement = document.createElement('img');
      mediaElement.src = API_URL + '/mediaserver/public/' + media.path;

      mediaElement.style.borderRadius = '10px';
      mediaElement.style.width = 'auto';
      mediaElement.style.height = '80vh';
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
        // this.deleteMedia(media._id);
      };

      mediaWrapper.appendChild(mediaElement);
      mediaWrapper.appendChild(deleteButton);

      wrapper.appendChild(mediaWrapper);
    });

    document.body.appendChild(wrapper);
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
    console.log(data);
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
      console.log('Updated message');
      if (data.spaceId === this.chatId) {
        const message = this.chatData$.messages.find(
          (msg: any) => msg._id === data._id
        );
        if (message) {
          message.text = data.text;
        }
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
    console.log('AfterViewChecked called');
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
