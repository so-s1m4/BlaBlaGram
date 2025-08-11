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
import { API_URL } from 'app/app.config';
import { SvgIconComponent } from '@utils/svg.component';
import { WebSocketService } from '@services/web-socket.service';
import { ChatsService } from '@features/chats/data/chats.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { ImgPipe } from '@utils/img.pipe';
import { AuthService } from '@services/auth.service';
import { AudioMessagePlayerComponent } from '../audio-message-player/audio-message-player.component';
import {OnVisibleOnceDirective} from "@utils/onVisibleOnce"

@Component({
  selector: 'app-message',
  imports: [
    CommonModule,
    SvgIconComponent,
    MediaPreviewComponent,
    ImgPipe,
    AudioMessagePlayerComponent,
    OnVisibleOnceDirective,
  ],
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
  @Output() onRead = new EventEmitter<number>();

  isEditing: boolean = false;
  repliedOn: any;
  showEmoji = false;
  emojis: any[] = [];
  // isVM = false;
  type: string = 'message';

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
  toggleEmoji(emjId: string) {
    this.chatService.toggleEmoji(this.data.id, emjId);
  }
  markAsRead() {
    if (this.data.wasRead || !this.data.seq) return;
    this.onRead.emit(this.data.seq)
  }
  onMediaGallery() {
    this.openMedia.emit(this.data.id);
  }
  get imageMedia() {
    return (
      this.data?.media?.filter(
        (media: any) =>
          media.mime.startsWith('image/') ||
          media.mime.startsWith('video/') ||
          media.type == 'audio'
      ) || []
    );
  }
  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
  ngOnInit() {
    this.webSocketService.on('emojis:toggle', (data: any) => {
      if (data.emoji.communicationId == this.data.id) {
        const emjUrl = data.emoji.emoji.emojiUrl;
        if (data.action == 'removed') {
          const emj = this.emojis.find((item: any) => {
            return item.url == emjUrl;
          });
          if (!emj) return;

          emj.members.splice(
            emj.members.indexOf({
              id: data.emoji.user.id,
              img: data.emoji.user.img[data.emoji.user.img.length - 1],
            }),
            1
          );
          if (emj.members.length == 0) {
            this.emojis.splice(this.emojis.indexOf(emj), 1);
          }
        } else {
          let found = this.emojis.find((item) => item.url == emjUrl);
          if (found) {
            found.members.push({
              id: data.emoji.user.id,
              img: data.emoji.user.img[data.emoji.user.img.length - 1],
            });
          } else {
            this.emojis.push({
              id: data.emoji.emoji.emojiUniqueId,
              url: emjUrl,
              members: [
                {
                  id: data.emoji.user.id,
                  img: data.emoji.user.img[data.emoji.user.img.length - 1],
                },
              ],
            });
          }
        }

        this.emojis.map((item) => {
          item.isMe = !!item.members.find(
            (item: any) => item.id == this.authService.me.id
          );
        });
      }
    });
    this.webSocketService.on('space:readMessages', (data: any) => {
      const { lastReadSeq, spaceId, userId } = data;
      if (this.data.seq <= lastReadSeq && this.data.sender.id == userId && !this.data.wasRead) {
        this.data.wasRead = true;
      }
    });

    // this.isVM = this.data.media.find((item: any)=>item.type=="video_message" || item.type == "audio")
    if (this.data.media.find((item: any) => item.type == 'video_message')) {
      this.type = 'kruzhok';
    } else if (this.data.media.find((item: any) => item.type == 'audio')) {
      this.type = 'gs';
    } else {
      this.type = 'message';
    }

    this.data.emojis?.forEach((item: any) => {
      let emj = item;
      let found = this.emojis.find((item) => item.url == emj.emojiUrl);
      if (found) {
        found.members.push({
          id: item.user.id,
          img: item.user.img[0],
        });
        return;
      }
      this.emojis.push({
        id: emj.emoji.emojiUniqueId,
        url: emj.emoji.emojiUrl,
        members: [
          {
            id: item.user.id,
            img: item.user.img[0],
          },
        ],
      });
    });
    this.emojis.map((item) => {
      item.isMe = !!item.members.find(
        (item: any) => item.id == this.authService.me.id
      );
    });

    if (!this.data.repliedOn) {
      this.repliedOn = null;
      return;
    }
    this.repliedOn = this.chatData.messages.find(
      (item: any) => item.id == this.data.repliedOn
    );
  }
  ngOnChanges() {
    if (!this.data.repliedOn) {
      this.repliedOn = null;
      return;
    }
    this.repliedOn = this.chatData.messages.find(
      (item: any) => item.id == this.data.repliedOn
    );
  }

  trackByEmoji(index: number, item: any): any {
    return item.id;
  }

  trackByUser(index: number, item: any): any {
    return item.id;
  }
}
