import { inject, Injectable } from '@angular/core';
import { ProfileData } from './profile.service';
import { API_URL } from '../app.config';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsService  {
  httpClient = inject(HttpClient);
  authService = inject(AuthService);
  webSocketService = inject(WebSocketService);

  friends: any[] = [];


  sendRequest(userId: string, text: string){
    this.webSocketService.send(
      "friends:createRequest",
      {receiver: userId, text},
      (ok: any, err: any, data: any)=>{
        console.log(ok)
      }
    )
  }
  getPendingRequests(callback: Function): void{
    this.webSocketService.send("friends:getRequestsList", {
      status: "sent",
    }, (ok: any, err: any, data: any)=>{
      if (ok) {
        callback(data)
      } else {
        console.error(err)
      }
    });
  }
  async getFriendsList(callback: any): Promise<ProfileData[]> {
    //@ts-ignore
    return this.httpClient
      .get<ProfileData[]>(`${API_URL}/api/users/me/friends`, {
        headers: {
          Authorization: `Bearer ${this.authService.token}`,
        },
      })
      .subscribe((data: any) => {this.friends=data.data; callback(data.data)});
  }

  acceptRequest(reqId: string, callback?: Function){
    this.webSocketService.send(
      "friends:acceptRequest",
      {requestId: reqId},
    )
  }
  declineRequest(reqId: string, callback?: Function){
    this.webSocketService.send(
      "friends:cancelRequest",
      {requestId: reqId},
    )
  }
  deleteRequest(reqId: string, callback?: Function){
    this.webSocketService.send(
      "friends:deleteRequest",
      {requestId: reqId},
      (ok: any, err: any, data: any)=>{
        if (ok){
          callback?.(data)
        }
      }
    )
  }
}
