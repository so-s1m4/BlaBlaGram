import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../app/services/web-socket.service';

@Component({
  selector: 'app-emoji-selector',
  imports: [SvgIconComponent, CommonModule],
  templateUrl: './emoji-selector.component.html',
  styleUrl: './emoji-selector.component.css',
})
export class EmojiSelectorComponent implements OnInit {
  @Input() style: any = {};

  firstLine: any[] = [];
  // otherEmojis: any[] = [];
  webSocketService = inject(WebSocketService);

  ngOnInit(): void {
    this.webSocketService.send(
      'emojis:getList',
      {},
      (ok: any, err: any, data: any) => {
        this.firstLine = data;
      }
    );
    // this.webSocketService.send(
    //   'emojis:getList',
    //   { offset: 8, limit: 1000 },
    //   (ok: any, err: any, data: any) => {
    //     this.otherEmojis = data;
    //   }
    // );
  }
}
