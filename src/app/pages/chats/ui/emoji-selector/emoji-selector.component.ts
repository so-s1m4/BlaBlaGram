import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '@services/web-socket.service';

@Component({
  selector: 'app-emoji-selector',
  imports: [SvgIconComponent, CommonModule],
  templateUrl: './emoji-selector.component.html',
  styleUrl: './emoji-selector.component.css',
})
export class EmojiSelectorComponent implements OnInit {
  @Input() style: any = {};
  @Output() select = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  firstLine: any[] = [];
  otherEmojis: any[] = [];
  webSocketService = inject(WebSocketService);
  showOther = false;

  ngOnInit(): void {
    this.webSocketService.send(
      'emojis:getList',
      {},
      (ok: any, err: any, data: any) => {
        this.firstLine = data;
      }
    );
    this.webSocketService.send(
      'emojis:getList',
      { offset: 8, limit: 1000 },
      (ok: any, err: any, data: any) => {
        this.otherEmojis = data;
      }
    );
  }

  toggle(event: Event){
    event.stopPropagation()
    this.showOther = !this.showOther;
  }

  onSelect(emjId: string) {
    this.select.emit(emjId);
    this.close.emit()
    this.showOther = false;
  }
}
