import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  AfterViewInit,
  Renderer2,
  ViewChild,
  ViewChildren,
  OnInit,
} from '@angular/core';
import { API_URL } from '../../app/app.config';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { WebSocketService } from '../../app/services/web-socket.service';
import { ChatsService } from '../../app/services/chats.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { ImgPipe } from '../../app/utils/img.pipe';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-message',
  imports: [CommonModule, SvgIconComponent, MediaPreviewComponent, ImgPipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements AfterViewInit, OnInit {
  @ViewChild('wrapper') wrapper: any;
  @ViewChildren('mediaItem') mediaItems: any;
  API_URL = API_URL;
  JSON = JSON;

  webSocketService = inject(WebSocketService);
  chatService = inject(ChatsService);
  authService = inject(AuthService);

  constructor(private renderer: Renderer2) {}
  ngAfterViewInit(): void {
    this.renderer.listen(this.wrapper.nativeElement, 'mousedown', (event) =>
      this.onLongPressStart(event, 500)
    );
    this.renderer.listen(this.wrapper.nativeElement, 'touchstart', (event) =>
      this.onLongPressStart(event, 500)
    );
    this.renderer.listen(
      this.wrapper.nativeElement,
      'mouseup',
      this.onLongPressEnd.bind(this)
    );
    this.renderer.listen(
      this.wrapper.nativeElement,
      'touchend',
      this.onLongPressEnd.bind(this)
    );
    this.mediaItems.forEach((item: any) => {
      this.renderer.listen(item.nativeElement, 'mousedown', (event) => {
        event.stopPropagation();
        this.onLongPressStart(event, 500);
      });
      this.renderer.listen(item.nativeElement, 'touchstart', (event) => {
        event.stopPropagation();
        this.onLongPressStart(event, 500);
      });
      this.renderer.listen(
        item.nativeElement,
        'mouseup',
        this.onLongPressEnd.bind(this)
      );
      this.renderer.listen(
        item.nativeElement,
        'touchend',
        this.onLongPressEnd.bind(this)
      );
    });
  }
  longPressTimeout: any;

  onLongPressStart(event: MouseEvent, delay: number) {
    const data = {
      currentTarget: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    if (event instanceof TouchEvent) {
      data.clientX = event.touches[0].clientX;
      data.clientY = event.touches[0].clientY;
    }

    this.longPressTimeout = setTimeout(() => {
      this.openContextMenu.emit(data);
    }, delay);
  }
  onLongPressEnd(event: MouseEvent | TouchEvent) {
    clearTimeout(this.longPressTimeout);
  }

  @Input() data: any;
  @Input() selectMode: boolean = false;
  @Input() isSender: boolean = false;
  @Input() showSender: boolean = false;
  @Input() chatData: any = {
    messages: [],
  };
  @Output() openMedia: EventEmitter<string> = new EventEmitter<string>();
  @Output() openContextMenu = new EventEmitter();
  @Output() onclick = new EventEmitter();

  isEditing: boolean = false;
  repliedOn: any;
  showEmoji = false;
  emoji: any[] = [];

  selectMessage($event: Event): void {
    this.data.isSelected = !this.data.isSelected;
  }
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isEditing && !event.shiftKey) {
      this.isEditing = false;
    }
  }
  onClick() {
    this.showEmoji = false;
    this.onclick.emit();
  }
  onContextMenu(event: Event) {
    event.preventDefault();
    this.showEmoji = true;
    this.openContextMenu.emit(event);
  }

  toggleEmoji(emjId: string){
    this.chatService.toggleEmoji(this.data._id, emjId)
  }

  onMediaGallery() {
    this.openMedia.emit(this.data._id);
  }
  get imageMedia() {
    return (
      this.data?.media?.filter(
        (media: any) =>
          media.mime.startsWith('image/') || media.mime.startsWith('video/')
      ) || []
    );
  }
  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
  ngOnInit() {
    this.webSocketService.on('emojis:toggle', (data: any) => {
      if (data.emoji.communicationId.id == this.data._id) {
        const emjUrl = data.emoji.emoji.url;
        if (data.action == 'removed') {
          const emj = this.emoji.find((item: any) => {
            return item.url == emjUrl;
          });
          if (!emj) return;

          emj.members.splice(
            emj.members.indexOf({
              id: data.emoji.userId.id,
              img: data.emoji.userId.img[0],
            }),
            1
          );
          if (emj.members.length == 0) {
            this.emoji.splice(this.emoji.indexOf(emj), 1);
          }
        } else {
          let found = this.emoji.find((item) => item.url == emjUrl);
          if (found) {
            found.members.push({
              id: data.emoji.userId.id,
              img: data.emoji.userId.img[0],
            });
          } else {
            this.emoji.push({
              id: data.emoji.emoji.id,
              url: emjUrl,
              members: [
                {
                  id: data.emoji.userId.id,
                  img: data.emoji.userId.img[0],
                },
              ],
            });
          }
        }

        this.emoji.map((item) => {
          let find = item.members.find(
            (item: any) => item.id === this.authService.me.id
          );
          item.isMe = !!find;
        });
      }
    });

    this.data.emoji?.forEach((item: any) => {
      let emj = item.emoji;
      let found = this.emoji.find((item) => item.url == emj.url);
      if (found) {
        found.members.push({
          id: item.userId.id,
          img: item.userId.img[0],
        });
        return;
      }
      this.emoji.push({
        id: emj.id,
        url: emj.url,
        members: [
          {
            id: item.userId.id,
            img: item.userId.img[0],
          },
        ],
      });
    });
    this.emoji.map((item) => {
      item.isMe = !!item.members.find(
        (item: any) => item.id == this.authService.me.id
      );
    });

    if (!this.data.repliedOn) {
      this.repliedOn = null;
      return;
    }
    this.repliedOn = this.chatData.messages.find(
      (item: any) => item._id == this.data.repliedOn
    );
  }
  ngOnChanges() {
    if (!this.data.repliedOn) {
      this.repliedOn = null;
      return;
    }
    this.repliedOn = this.chatData.messages.find(
      (item: any) => item._id == this.data.repliedOn
    );
  }
}
