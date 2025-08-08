import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { API_URL } from 'app/app.config';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(API_URL, {
      transports: ['websocket'],
      auth: {
        token: token,
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });
  }
  send(event: string, dataOrCallback: any | Function, callback?: Function) {
    if (!this.socket) {
      console.error('[Socket] Not connected!');
      return;
    }
    if (typeof dataOrCallback === 'function') {
      // Only event and callback provided
      this.socket.emit(event, (ok: any, err: any, data: any) => {
        dataOrCallback(ok, err, data);
      });
    } else {
      // event, data, and callback provided
      this.socket.emit(
        event,
        dataOrCallback,
        (ok: any, err: any, data: any) => {
          if (callback) {
            callback(ok, err, data);
          }
        }
      );
    }
  }
  on<T>(event: string, callback: (data: T) => void): void {
    this.socket.on(event, callback);
  }
  disconnect(): void {
    if (this.socket.connected) this.socket.disconnect();
  }

  get socket$() {
    return this.socket;
  }
}
