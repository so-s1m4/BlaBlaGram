import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  usersData: any = {};
  giftsData: any = {};
  emojisData: any = {};
  messagesData: any = {};
  postsData: any = {};
  logsData: any = {};

  constructor(private httpClient: HttpClient) {
    this.httpClient.get('/admin/users').subscribe((data: any) => {
      console.log(data);
      this.usersData.list = data.data;
    });
    this.httpClient.get('/admin/gifts').subscribe((data: any) => {
      this.giftsData.list = data.data;
    });
    this.httpClient.get('/admin/emojis').subscribe((data: any) => {
      this.emojisData.list = data.data;
    });
    this.httpClient.get('/admin/messages').subscribe((data: any) => {
      this.messagesData.list = data.data;
    });
  }

  updateUser(userId: string, formData: FormData) {
    return this.httpClient.patch(`/admin/users/${userId}`, formData);
  }
  deleteUser(userId: string) {
    return this.httpClient.delete(`/admin/users/${userId}`);
  }
  createUser(body: any) {
    return this.httpClient.post(`/admin/users`, body);
  }

  updateGift(giftId: string, body: any) {
    return this.httpClient.patch(`/admin/gifts/${giftId}`, body);
  }
  deleteGift(giftId: string) {
    return this.httpClient.delete(`/admin/gifts/${giftId}`);
  }
  createGift(body: any) {
    return this.httpClient.post(`/admin/gifts`, body);
  }

  updateEmoji(emojiId: string, body: any) {
    return this.httpClient.patch(`/admin/emojis/${emojiId}`, body);
  }
  deleteEmoji(emojiId: string) {
    return this.httpClient.delete(`/admin/emojis/${emojiId}`);
  }
  createEmoji(body: any) {
    return this.httpClient.post(`/admin/emojis`, body);
  }

  updateMessage(messageId: string, body: any) {
    return this.httpClient.patch(`/admin/messages/${messageId}`, body);
  }
  deleteMessage(messageId: string) {
    return this.httpClient.delete(`/admin/messages/${messageId}`);
  }
  createMessage(body: any) {
    return this.httpClient.post(`/admin/messages`, { body });
  }

  fetchPosts() {
    this.httpClient.get('/admin/posts').subscribe((data: any) => {
      this.postsData.list = data.data;
    });
  }
  deletePost(postId: string) {
    return this.httpClient.delete(`/admin/posts/${postId}`);
  }

  fetchLogs() {
    this.httpClient.get('/admin/logs').subscribe((data: any) => {
      this.logsData.list = data.data;
    });
  }
}
