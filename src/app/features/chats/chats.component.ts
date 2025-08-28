import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChatPreviewComponent } from './ui/chat-preview/chat-preview.component';
import { ChatsService } from './data/chats.service';
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
    event.preventDefault();
  }
  window = window;

  router = inject(Router);
  aRoute = inject(ActivatedRoute);

  private chats: { list: any[] } = { list: [] };
  chatsService = inject(ChatsService);
  showCreateModal = false;
  hasChildRoute = false;

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
  }
  selectChat(chat: any) {
    this.router.navigate(['chats', chat.id]);
  }
  closeChat() {
    this.router.navigate(['']);
  }
  ngOnInit(): void {
    this.chats = this.chatsService.chats;
  }
  get getChats(): { list: any[] } {
    return this.chats;
  }
}
