import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { catchError, windowTime } from 'rxjs';
import { WebSocketService } from '@services/web-socket.service';

import { API_URL } from '../../app.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthed: null | boolean = null;
  private webSocketService = inject(WebSocketService);
  me: any = null;
  onInit() {
    this.token = localStorage.getItem('token');
    if (!this.token) {
      this.isAuthed = false;
      return;
    }
    this.isAuthed = true;
    this.getMeRequest().then((user) => {
      if (user) {
        this.me = user.data;
        this.me.img.reverse();
      }
    });

    this.webSocketService.connect(this.token);
  }
  httpClient = inject(HttpClient);
  router = inject(Router);
  token: string | null = null;
  constructor() {}
  async login(payload: { username: string; password: string }) {
    try {
      const response: any = await this.httpClient
        .post(`${API_URL}/users/login`, payload)
        .toPromise();

      const token = response?.data;
      if (token) {
        localStorage.setItem('token', token);
        this.token = token;
        this.isAuthed = true;
        this.webSocketService.connect(token);
        this.getMeRequest().then((user) => {
          if (user) {
            this.me = user.data;
            this.addAccount({
              username: this.me.username,
              name: this.me.name,
              img: this.me.img,
              token: token,
            });
          }
        });
      } else {
        this.isAuthed = false;
      }
    } catch (error) {
      console.error('Login error', error);
      this.isAuthed = false;
    }
    return this.isAuthed;
  }
  logout() {
    this.removeAccount(this.token!);
    this.token = null;
    this.isAuthed = false;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    window.location.reload();
  }
  async register(payload: {
    username: string;
    password: string;
    name: string;
  }) {
    try {
      const response: any = await this.httpClient
        .post(`${API_URL}/users/register`, payload)
        .toPromise();

      const token = response?.data;
      if (token) {
        this.token = token;
        localStorage.setItem('token', token);
        this.isAuthed = true;
        this.webSocketService.connect(token);
        this.getMeRequest().then((user) => {
          if (user) {
            this.me = user.data;
            this.addAccount({
              username: this.me.username,
              name: this.me.name,
              img: this.me.img,
              token: token,
            });
          }
        });
      } else {
        this.isAuthed = false;
      }
    } catch (error) {
      console.error('Login error', error);
      this.isAuthed = false;
    }
    return this.isAuthed;
  }
  async getMeRequest() {
    if (!this.isAuthed) {
      return Promise.resolve(null);
    }

    try {
      const response: any = await this.httpClient
        .get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${
              this.token || localStorage.getItem('token')
            }`,
          },
        })
        .toPromise();
      return response;
    } catch (error) {
      this.logout();
    }
  }
  setIsAuthed(value: boolean) {
    this.isAuthed = value;
  }
  getIsAuthed() {
    return this.isAuthed;
  }
  getAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
  }
  switchAccount(token: string) {
    localStorage.setItem('token', token);
    window.location.reload();
  }
  setAccounts(accounts: any[]) {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
  addAccount(account: any) {
    const accounts = this.getAccounts();
    const acc = accounts.find((acc: any) => acc.token === account.token || acc.username === account.username);
    if (acc) {
      acc.token = account.token;
    } else {
      accounts.push(account);
    }
    this.setAccounts(accounts);
  }
  removeAccount(token: string) {
    let accounts = this.getAccounts();
    accounts = accounts.filter((acc: any) => acc.token !== token);
    this.setAccounts(accounts);
  }
}
