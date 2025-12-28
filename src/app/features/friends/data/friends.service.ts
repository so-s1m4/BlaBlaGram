import { inject, Injectable } from '@angular/core';
import { ProfileData } from '@features/profile/data/profile.service';
import { API_URL } from 'app/app.config';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import { WebSocketService } from '@services/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  constructor() {
    this.getFriendsList();
    this.getPendingRequests();
    this.webSocketService.on('friends:newRequest', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.data.requests.oncoming.push(data);
      } else {
        this.data.requests.incoming.push(data);
      }
    });
    this.webSocketService.on('friends:requestAccepted', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.data.requests.oncoming = this.data.requests.oncoming.filter(
          (item: any) => item.id != data.id
        );
        this.data.friends.list.push(data.receiver_id);
      } else {
        this.data.friends.list.push(data.sender_id);
        this.data.requests.incoming = this.data.requests.incoming.filter(
          (item: any) => item.id != data.id
        );
      }
    });
    this.webSocketService.on('friends:requestCanceled', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.data.requests.oncoming = this.data.requests.oncoming.filter(
          (item: any) => item.id != data.id
        );
      } else {
        this.data.requests.incoming = this.data.requests.incoming.filter(
          (item: any) => item.id != data.id
        );
      }
    });
    this.webSocketService.on('friends:friendOnline', (data: any) => {
      this.setFriendOnline(data.userId);
    });
    this.webSocketService.on('friends:friendOffline', (data: any) => {
      this.setFriendOffline(data.userId);
    });
  }

  httpClient = inject(HttpClient);
  authService = inject(AuthService);
  webSocketService = inject(WebSocketService);

  private data$: {
    friends: {
      list: any[];
    };
    requests: {
      oncoming: any[];
      incoming: any[];
    };
  } = {
    friends: {
      list: [],
    },
    requests: {
      oncoming: [],
      incoming: [],
    },
  };

  sendRequest(userId: string, text: string) {
    this.webSocketService.send(
      'friends:createRequest',
      { receiver: userId, text },
      (ok: any, err: any, data: any) => {}
    );
  }
  getPendingRequests(): void {
    this.webSocketService.send(
      'friends:getRequestsList',
      {
        status: 'sent',
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.data$.requests = {
            incoming: data.filter(
              (item: any) => item.sender_id.id !== this.authService.me.id
            ),
            oncoming: data.filter(
              (item: any) => item.receiver_id.id !== this.authService.me.id
            ),
          };
        } else {
          console.error(err);
        }
      }
    );
  }
  async getFriendsList(): Promise<ProfileData[]> {
    //@ts-ignore
    return this.httpClient
      .get<ProfileData[]>(`/users/me/friends`)
      .subscribe((data: any) => {
        this.data$.friends.list = data.data;
      });
  }
  async delFriend(friendId: string) {
    //@ts-ignore
    return this.httpClient
      .delete(`/users/me/friends`, {
        body: {
          friendId,
        },
      })
      .subscribe(() => {
        this.data$.friends.list = this.data$.friends.list.filter((item) => {
          return item.id != friendId;
        });
      });
  }
  acceptRequest(reqId: string, callback?: Function) {
    this.webSocketService.send('friends:acceptRequest', { requestId: reqId });
  }
  declineRequest(reqId: string, callback?: Function) {
    this.webSocketService.send('friends:cancelRequest', { requestId: reqId });
  }
  deleteRequest(reqId: string, callback?: Function) {
    this.webSocketService.send(
      'friends:deleteRequest',
      { requestId: reqId },
      (ok: any, err: any, data: any) => {
        if (ok) {
          callback?.(data);
        }
      }
    );
  }

  setFriendOnline(userId: string) {
    this.data.friends.list.find((item) => item.id == userId).isOnline = true;
  }
  setFriendOffline(userId: string) {
    this.data.friends.list.find((item) => item.id == userId).isOnline = false;
  }

  get data() {
    return this.data$;
  }

  getFriend(friendId: string) {
    return this.data$.friends.list.find((item: any) => item.id == friendId);
  }
}
