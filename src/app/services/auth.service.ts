import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthed: null | boolean = null;

  onInit() {
    this.isAuthed = !!localStorage.getItem('token');
  }

  httpClient = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/api/auth/';
  constructor() {}

  login(payload: { email: string; password: string }) {
    console.log('Login payload:', payload);
    this.httpClient
      .post(`${this.apiUrl}signin`, payload)
      .pipe(
        catchError((error) => {
          console.error('Login error', error);
          return [];
        })
      )
      .subscribe((response) => {
        console.log('Login successful', response);
      });
    // this.isAuthed = true;
    // return this.isAuthed;
  }

  getIsAuthed() {
    return this.isAuthed;
  }
}
