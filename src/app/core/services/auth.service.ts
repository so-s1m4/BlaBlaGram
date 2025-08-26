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
      localStorage.removeItem('token');
      this.isAuthed = false;
    }
  }

  getIsAuthed() {
    return this.isAuthed;
  }
}
