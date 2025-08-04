import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './web-socket.service';
import { API_URL } from '../app.config';
import { AuthService } from './auth.service';

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

  public async getProfile(userId: string | null): Promise<ProfileData | null> {
    return Promise.resolve(null);
  }

  getUsersStartsWith(data: string, callback?: Function){
    this.httpClient.get(
      API_URL + "/api/users",
      {
        headers:{
          Authorization: "Bearer " + this.authService.token
        },
        params:{
          startsWith: data
        }
      }
    ).subscribe((res: any)=>{
      const filtered = res.data.filter((item: any)=>{
        return item.id !== this.authService.me.id
      })
      callback?.(filtered)
    })
  }

  openChat(userId: string, callback: (data: any) => void) {
    this.webSocketService.send(
      'spaces:chats:create',
      { userId },
      (ok: any, err: any, data: any) => {
        if(ok) {
          callback(data)
        } else {
          console.error(err)
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
