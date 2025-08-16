import { Component, createEnvironmentInjector, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChatPreviewComponent } from './ui/chat-preview/chat-preview.component';
import { ChatsService } from './data/chats.service';
import { ChatComponent } from './ui/chat/chat.component';
import { WebSocketService } from '../../core/services/web-socket.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@shared/utils/svg.component';
import { Modal } from '@shared/common-ui/modal/modal';
import { CreateModalPopUp } from './ui/create-space-pop-up-modal/create-space-pop-up-modal';

@Component({
  selector: 'app-chats',
  imports: [
    ChatPreviewComponent,
    CommonModule,
    SvgIconComponent,
    Modal,
    CreateModalPopUp,
    RouterOutlet,
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit {
  @ViewChild('contextmenu') cm: any;

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
  window = window;

  router = inject(Router);
  aRoute = inject(ActivatedRoute);
  webSocketService = inject(WebSocketService);

  private chats: any[] = [];
  chatsService = inject(ChatsService);
  showCreateModal = false;

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
  }

  selectChat(chat: any) {
    this.router.navigate(['chats', chat.id]);
  }
  closeChat() {
    this.router.navigate(['']);
  }
  setChats(chats: any[]) {
    this.chats = chats;
  }
  ngOnInit(): void {
    this.chatsService.chats(this.setChats.bind(this));
    // this.aRoute.queryParamMap.subscribe((params) => {
    //   this.currentChat = params.get('id')?.trim();
    // });
    this.webSocketService.on('space:addedToNew', (data: any) => {
      this.chatsService.chats(this.setChats.bind(this));
    });
  }
  get getChats(): any[] {
    return this.chats;
  }
}
