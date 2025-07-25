import {
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

@Component({
  selector: 'app-chat',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnChanges, OnDestroy {
  API_URL = API_URL;

  constructor(private router: ActivatedRoute) {}

  layout = inject(LayoutComponent);
  chatService = inject(ChatsService);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);
  route: Router = inject(Router);

  me: any = this.authService.me;

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
      //@ts-ignore
      document.getElementById('message-input')!.value || '',
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.scrollToBottom();
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

  goBack(): void {
    this.close.emit();
  }

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

  public onNewMessage(data: any): boolean {
    if (data.spaceId !== this.chatId) {
      const popUpData = {
        type: 'newMessage',
        title:
          this.chatService
            .chats()!
            .find((chat: any) => chat._id === data.spaceId)?.title ||
          'New Message',
        chatId: data.spaceId,
        message: data.text,
      };

      console.log('New message not for current chat:', data);

      this.layout.showPopUp(popUpData);
      return false;
    }
    this.chatData$.messages.push(data);
    this.scrollToBottom();
    return true;
  }

  ngOnInit(): void {
    this.loadChat();
    this.webSocketService.on('communication:newMessage', (data: any) => {
      this.onNewMessage(data);
    });
  }

  ngOnChanges(): void {
    this.loadChat();
  }

  ngOnDestroy(): void {
    this.chatService.selectChat('');
  }

  get chatData(): any {
    return this.chatData$;
  }
}
