import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'BlaBlaGram';
  changeMainColor(color: string) {
    localStorage.setItem('mainColor', color);
    document.documentElement.style.setProperty('--primary-color', color);
  }
  resetMainColor() {
    console.log('reset');
    localStorage.setItem('mainColor', '');

    document.documentElement.style.setProperty('--primary-color', '');
  }
  ngOnInit(): void {
    const color = localStorage.getItem('mainColor');
    document.documentElement.style.setProperty('--primary-color', color);

    navigator.mediaDevices.getUserMedia({audio: true, video: true});
  }
}
