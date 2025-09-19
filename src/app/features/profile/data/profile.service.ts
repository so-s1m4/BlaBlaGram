import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '@services/web-socket.service';
import { API_URL } from 'app/app.config';
import { AuthService } from '@services/auth.service';
import { Observable } from 'rxjs/internal/Observable';

export type ProfileData = {
  _id: string;
  username: string;
  img: { path: string; size: number }[];
  name: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  httpClient = inject(HttpClient);

  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);
  constructor() {}

  public getProfile(userId: string | null): any {
    return this.httpClient.get(API_URL + '/users/' + userId, {
      headers: {
        Authorization: 'Bearer ' + this.authService.token,
      },
    });
  }
  editProfile(payload: FormData): Observable<{ data: any }> {
    // adjust URL to match your backend
    return this.httpClient.patch<{ data: any }>(
      API_URL + `/users/me`,
      payload,
    );
  }
  deletePhoto(path: string) {
    return this.httpClient.delete<{ data: any }>(
      API_URL + `/users/me/photos/` + path,
    );
  }
  getUsersStartsWith(data: string, callback?: Function) {
    this.httpClient
      .get(API_URL + '/users', {
        headers: {
          Authorization: 'Bearer ' + this.authService.token,
        },
        params: {
          startsWith: data,
        },
      })
      .subscribe((res: any) => {
        const filtered = res.data.filter((item: any) => {
          return item.id !== this.authService.me.id;
        });
        callback?.(filtered);
      });
  }
  openChat(userId: string, callback: (data: any) => void) {
    this.webSocketService.send(
      'spaces:chats:create',
      { userId },
      (ok: any, err: any, data: any) => {
        if (ok) {
          callback(data);
        } else {
          console.error(err);
        }
      }
    );
  }
  async getPendingRequests(): Promise<ProfileData[]> {
    return [];
  }
  async getBlockedUsers(): Promise<ProfileData[]> {
    return [];
  }
}
