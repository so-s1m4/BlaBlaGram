import { inject, Injectable, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { WebSocketService } from '@core/services/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class Gifts {
  websocketService = inject(WebSocketService);
  gifts: { list: any[] } = { list: [] };
  authService = inject(AuthService);

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
          this.authService.me.currency -= data.gift.value;
        } else {
          console.error('Error sending gift', err);
        }
      }
    );
  }
  sell(transactionId: string) {
    this.websocketService.send(
      'gifts:sell',
      { transactionId },
      (ok: any, err: any, data: any) => {
        if (ok) {
          const gift = this.authService.me.gifts.find(
            (g: any) => g.tid === transactionId
          );
          if (gift) {
            console.log(gift)
            this.authService.me.currency += gift.gift.value * 0.75;
          }
          this.authService.me.gifts = this.authService.me.gifts.filter(
            (g: any) => g.tid !== transactionId
          );
        } else {
          console.error('Error selling gift', err);
        }
      }
    );
  }
}
