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
  httpClient = inject(HttpClient);
  authService = inject(AuthService);
  webSocketService = inject(WebSocketService);

  friends: {
    list: any[];
  } = {
    list: [],
  };
  pendingRequests: {
    list: any[];
  } = {
    list: [],
  };

  sendRequest(userId: string, text: string) {
    this.webSocketService.send(
      'friends:createRequest',
      { receiver: userId, text },
      (ok: any, err: any, data: any) => {
        console.log(ok);
      }
    );
  }
  getPendingRequests(callback: Function): void {
    this.webSocketService.send(
      'friends:getRequestsList',
      {
        status: 'sent',
      },
      (ok: any, err: any, data: any) => {
        if (ok) {
          this.pendingRequests.list = data;
          callback(this.pendingRequests);
        } else {
          console.error(err);
        }
      }
    );
  }
  async getFriendsList(callback: any): Promise<ProfileData[]> {
    //@ts-ignore
    return this.httpClient
      .get<ProfileData[]>(`${API_URL}/api/users/me/friends`, {
        headers: {
          Authorization: `Bearer ${this.authService.token}`,
        },
      })
      .subscribe((data: any) => {
        this.friends.list = data.data;
        callback(this.friends);
      });
  }
  async delFriend(friendId: string, callback: any) {
    //@ts-ignore
    return this.httpClient
      .delete(`${API_URL}/api/users/me/friends`, {
        headers: {
          Authorization: `Bearer ${this.authService.token}`,
        },
        body: {
          friendId,
        },
      })
      .subscribe(() => {
        this.friends.list = this.friends.list.filter((item) => {
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
    this.friends.list.find((item) => item.id == userId).isOnline = true;
  }
  setFriendOffline(userId: string) {
    this.friends.list.find((item) => item.id == userId).isOnline = false;
  }
}
