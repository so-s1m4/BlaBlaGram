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

  selectMessage($event: Event): void {
    this.data.isSelected = !this.data.isSelected;
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
  onClick(){
    this.showEmoji = false
    this.onclick.emit()
  }
  onContextMenu(event: Event) {
    event.preventDefault();
    this.showEmoji = true;
    this.openContextMenu.emit(event);
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
