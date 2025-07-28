import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { API_URL } from '../../app/app.config';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { WebSocketService } from '../../app/services/web-socket.service';

@Component({
  selector: 'app-message',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  API_URL = API_URL;

  webSocketService = inject(WebSocketService);

  @Input() data: any;
  @Input() selectMode: boolean = false;
  @Input() isSender: boolean = false;
  @Output() openMedia: EventEmitter<string> = new EventEmitter<string>();

  isEditing: boolean = false;

  contextMenuShow: boolean = false;

  changeText(event$: Event) {
    //@ts-ignore
    let newText = event$.target.value;
    this.data.text = newText;

    this.webSocketService.send('communication:chats:update', {
      communicationId: this.data._id,
      text: newText,
    });
  }
  editMessage() {
    this.isEditing = !this.isEditing;
    this.contextMenuShow = false;
  }
  deleteMessage() {
    this.webSocketService.send('communication:chats:delete', {
      communicationId: this.data._id,
    });
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
      this.contextMenuShow = false;
    }
  }

  get imageMedia() {
    return (
      this.data?.media?.filter((media: any) =>
        media.mime.startsWith('image/')
      ) || []
    );
  }

  openContextMenu($event: Event) {
    $event.preventDefault();
    this.contextMenuShow = !this.contextMenuShow;

    //@ts-ignore
    $event!.currentTarget!.querySelectorAll('.context-menu')[0].style.left = 0;
    //@ts-ignore
    $event!.currentTarget!.querySelectorAll('.context-menu')[0].style.top = 0;
  }

  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
}
