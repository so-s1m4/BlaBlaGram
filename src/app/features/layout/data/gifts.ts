import { inject, Injectable, OnInit } from '@angular/core';
import { WebSocketService } from '@core/services/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class Gifts {
  websocketService = inject(WebSocketService);
  gifts: { list: any[] } = { list: [] };
  constructor() {
    console.log('Gifts service initialized');
    this.websocketService.send(
      'gifts:getList',
      {},
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.gifts.list = data;
          console.log('Gifts list received', data);
        } else {
          console.error(err);
        }
      }
    );
  }

  send(giftId: string, userId: string, text: string, anonymous: boolean) {
    this.websocketService.send(
      'gifts:send',
      { uid: giftId, userId, text, anonymous },
      (ok: any, err: any, data: any) => {
        if (ok) {
          console.log('Gift sent', data);
        } else {
          console.error('Error sending gift', err);
        }
      }
    );
  }
}
