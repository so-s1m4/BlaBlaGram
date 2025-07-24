import { Component } from '@angular/core';

@Component({
  selector: 'app-titlebar',
  imports: [],
  templateUrl: './titlebar.component.html',
  styleUrl: './titlebar.component.css',
})
export class TitlebarComponent {
  minimizeWindow() {
    window.electronAPI?.minimize();
  }

  maximizeWindow() {
    window.electronAPI?.maximize();
  }

  closeWindow() {
    window.electronAPI?.close();
  }
}
