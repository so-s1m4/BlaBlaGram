import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
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

@Component({
  selector: 'app-chat',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnChanges {
  API_URL = API_URL;

  constructor(private router: ActivatedRoute) {}

  chatService = inject(ChatsService);
  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);
  route: Router = inject(Router);

  me: any = this.authService.me;

  private chatData$: any;

  @Input() chatId: string | undefined = '';
  @Output('closeChat') close = new EventEmitter<void>();

  sendMessage(): void {
    this.webSocketService.send(
      'communication:chats:create',
      {
        spaceId: this.chatId,
        // @ts-ignore
        text: document.getElementById('message-input')?.value || '',
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.webSocketService.send(
            'communication:chats:close',
            { communicationId: data._id },
            this.loadChat.bind(this)
          );
        } else {
          console.error('Error sending message:', err);
        }
      }
    );
    //@ts-ignore
    document.getElementById('message-input').value = '';
  }

  goBack(): void {
    this.close.emit();
  }

  setChatData(chatData: any): void {
    this.me = this.authService.me;
    this.chatData$ = chatData;
  }

  public async loadChat(): Promise<void> {
    if (!this.chatId) {
      return Promise.resolve();
    }
    this.chatService.getChatById(this.chatId, this.setChatData.bind(this));
  }

  ngOnInit(): void {
    this.loadChat();
    this.webSocketService.on('communication:newMessage', (data) => {
      this.chatData$.push(data);
    });
  }
  ngOnChanges(): void {
    this.loadChat();
  }

  get chatData(): any {
    return this.chatData$;
  }
}
