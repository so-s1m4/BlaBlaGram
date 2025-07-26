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

  banUser(username: string): Promise<void> {
    // Simulate an API call to ban a user
    return new Promise((resolve) => {
      console.log(`User ${username} has been banned.`);
      resolve();
    });
  }

  unbanUser(username: string): Promise<void> {
    // Simulate an API call to unban a user
    return new Promise((resolve) => {
      console.log(`User ${username} has been unbanned.`);
      resolve();
    });
  }

  followUser(username: string): Promise<void> {
    // Simulate an API call to follow a user
    return new Promise((resolve) => {
      console.log(`You are now following ${username}.`);
      resolve();
    });
  }

  openChat(userId: string, callback: (data: any) => void) {
    this.webSocketService.send(
      'spaces:chats:create',
      { userId },
      (ok: any, err: any, data: any) => {
        if(ok) {
          callback(data)
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
      .subscribe((data: any) => callback(data.data));
  }
  async getPendingRequests(): Promise<ProfileData[]> {
    return [];
  }
  async getBlockedUsers(): Promise<ProfileData[]> {
    return [];
  }
}
