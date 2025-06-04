import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatsService } from '../../services/chats.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../utils/svg.component';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnChanges {
  chatService = inject(ChatsService);
  constructor(private router: ActivatedRoute) {}
  route: Router = inject(Router);

  private chatData$: any;

  @Input() chatUsername: string | undefined = '';
  @Output("closeChat") close = new EventEmitter<void>();

  sendMessage(): void {
    console.log(this.chatUsername);
  }

  goBack(): void {
    this.close.emit();
  }

  public async loadChat(): Promise<void> {
    this.chatData$ = this.chatService.getChatById(this.chatUsername!);
  }

  ngOnInit(): void {
    this.loadChat();
  }
  ngOnChanges(): void {
    this.loadChat();
  }

  get chatData(): any {
    return this.chatData$;
  }
}
