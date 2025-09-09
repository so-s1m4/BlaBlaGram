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
  OnChanges,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { API_URL } from 'app/app.config';
import { SvgIconComponent } from '@utils/svg.component';
import { WebSocketService } from '@services/web-socket.service';
import { ChatsService } from '@features/chats/data/chats.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { ImgPipe } from '@utils/img.pipe';
import { AuthService } from '@services/auth.service';
import { AudioMessagePlayerComponent } from '../audio-message-player/audio-message-player.component';
import { OnVisibleOnceDirective } from '@shared/utils/visibleOnce';
import { MediaPipe } from '../../../../shared/utils/media.pipe';

@Component({
  selector: 'app-message',
  imports: [
    CommonModule,
    SvgIconComponent,
    MediaPreviewComponent,
    ImgPipe,
    AudioMessagePlayerComponent,
    OnVisibleOnceDirective,
    MediaPipe,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
  @ViewChild('wrapper') wrapper: any;
  @ViewChildren('mediaItem') mediaItems: any;
  API_URL = API_URL;
  JSON = JSON;

  webSocketService = inject(WebSocketService);
  chatService = inject(ChatsService);
  authService = inject(AuthService);

  constructor(private renderer: Renderer2, private ngZone: NgZone) {}

  private teardownFns: Array<() => void> = [];

  private addPassive(el: HTMLElement, type: string, handler: EventListener) {
    el.addEventListener(type, handler, { passive: true } as AddEventListenerOptions);
    this.teardownFns.push(() => el.removeEventListener(type, handler));
  }

  ngAfterViewInit(): void {
    // mouse events via Renderer2 (cleanup stored)
    this.teardownFns.push(
      this.renderer.listen(this.wrapper.nativeElement, 'mousedown', (event) =>
        this.onLongPressStart(event, 500)
      )
    );
    this.teardownFns.push(
      this.renderer.listen(
        this.wrapper.nativeElement,
        'mouseup',
        this.onLongPressEnd.bind(this)
      )
    );

    // touch events as passive listeners to avoid scroll-blocking warnings
    const wrapperTouchStart = (event: Event) => this.onLongPressStart(event as any, 500);
    const wrapperTouchEnd = (event: Event) => this.onLongPressEnd(event as any);
    this.addPassive(this.wrapper.nativeElement, 'touchstart', wrapperTouchStart);
    this.addPassive(this.wrapper.nativeElement, 'touchend', wrapperTouchEnd);

    this.mediaItems.forEach((item: any) => {
      // mouse events via Renderer2 (cleanup stored)
      this.teardownFns.push(
        this.renderer.listen(item.nativeElement, 'mousedown', (event) => {
          event.stopPropagation();
          this.onLongPressStart(event, 500);
        })
      );
      this.teardownFns.push(
        this.renderer.listen(
          item.nativeElement,
          'mouseup',
          this.onLongPressEnd.bind(this)
        )
      );

      // touch events as passive listeners
      const itemTouchStart = (ev: Event) => {
        ev.stopPropagation();
        this.onLongPressStart(ev as any, 500);
      };
      const itemTouchEnd = (ev: Event) => this.onLongPressEnd(ev as any);
      this.addPassive(item.nativeElement, 'touchstart', itemTouchStart);
      this.addPassive(item.nativeElement, 'touchend', itemTouchEnd);
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
  @Output() scrollToMsg = new EventEmitter<string>();

  isEditing: boolean = false;
  repliedOn: any;
  showEmoji = false;
  emojis: any[] = [];
  type: string = 'message';

  private rebuildReactions() {
    const map = new Map<
      string,
      {
        id: string;
        url: string;
        members: { id: string; img?: string }[];
        isMe?: boolean;
      }
    >();
    const list = this.data?.emojis ?? [];

    for (const r of list) {
      const id = r?.emoji?.emojiUniqueId;
      const url = r?.emoji?.emojiUrl;
      const uid = r?.user?.id;
      const uimg = r?.user?.img?.[0];
      if (!id || !url || !uid) continue;

      if (!map.has(id)) {
        map.set(id, { id, url, members: [] });
      }
      const group = map.get(id)!;
      if (!group.members.some((m) => m.id === uid)) {
        group.members.push({ id: uid, img: uimg });
      }
    }

    this.emojis = Array.from(map.values()).map((g) => ({
      ...g,
      isMe: g.members.some((m) => m.id === this.authService.me.id),
    }));
  }

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
  onScrollToMsg() {
    this.scrollToMsg.emit(this.repliedOn.id as string);
  }
  toggleEmoji(emjId: string) {
    this.chatService.toggleEmoji(this.data.id, emjId);
  }
  markAsRead() {
    if (!this.data.seq) return;
    this.onRead.emit(this.data.seq);
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
    if (this.data.media.find((item: any) => item.type == 'video_message')) {
      this.type = 'kruzhok';
    } else if (this.data.media.find((item: any) => item.type == 'audio')) {
      this.type = 'gs';
    } else {
      this.type = 'message';
    }
    this.rebuildReactions();
    this.webSocketService.on('emojis:toggle', (data: any) => {
      if (data.emoji.communicationId !== this.data.id) return;
      this.rebuildReactions();
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
    this.rebuildReactions();
    if (!this.data.repliedOn) {
      this.repliedOn = null;
      return;
    }
    this.repliedOn = this.chatData.messages.find(
      (item: any) => item.id == this.data.repliedOn
    );
  }

  ngOnDestroy(): void {
    try { clearTimeout(this.longPressTimeout); } catch {}
    for (const off of this.teardownFns) {
      try { off(); } catch {}
    }
    this.teardownFns = [];
  }

  trackByEmoji(index: number, item: any): any {
    return item.id;
  }

  trackByUser(index: number, item: any): any {
    return item.id;
  }
}
