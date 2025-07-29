import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { API_URL } from '../../app/app.config';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { WebSocketService } from '../../app/services/web-socket.service';
import { ChatsService } from '../../app/services/chats.service';

@Component({
  selector: 'app-message',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  API_URL = API_URL;
  JSON = JSON;

  webSocketService = inject(WebSocketService);
  chatService = inject(ChatsService);

  @Input() data: any;
  @Input() selectMode: boolean = false;
  @Input() isSender: boolean = false;
  @Output() openMedia: EventEmitter<string> = new EventEmitter<string>();
  @Output() openContextMenu = new EventEmitter();
  @Output() onclick = new EventEmitter();

  isEditing: boolean = false;

  selectMessage($event: Event): void {
    this.data.isSelected = !this.data.isSelected || true;
  }

  changeText(event$: Event) {
    //@ts-ignore
    let newText = event$.target.value;
    this.data.text = newText;

    this.webSocketService.send('communication:chats:update', {
      communicationId: this.data._id,
      text: newText,
    });
  }
  deleteMessage() {
    this.chatService.deleteMessages([this.data._id]);
  }
  deleteMedia(mediaId: string) {
    console.log('delete media', mediaId);
    this.webSocketService.send(
      'communication:chat:deleteMedia',
      {
        mediaId,
      },
      (ok: any, err: any, data: any) => {
        console.log(ok, err, data);
      }
    );
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isEditing && !event.shiftKey) {
      this.isEditing = false;
    }
  }
  onContextMenu(event: Event) {
    event.preventDefault();
    this.openContextMenu.emit(event);
  }

  get imageMedia() {
    return (
      this.data?.media?.filter((media: any) =>
        media.mime.startsWith('image/')
      ) || []
    );
  }

  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
}
