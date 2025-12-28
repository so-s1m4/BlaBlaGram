import { Component, OnInit } from '@angular/core';
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
    document.documentElement.style.setProperty('--main-color', color);
  }
  resetMainColor() {
    localStorage.setItem('mainColor', '');

    document.documentElement.style.setProperty('--main-color', '');
  }
  ngOnInit(): void {
    const color = localStorage.getItem('mainColor');
    document.documentElement.style.setProperty('--main-color', color);
  }
}
