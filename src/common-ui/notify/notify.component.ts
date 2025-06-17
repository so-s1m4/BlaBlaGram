import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notify',
  imports: [CommonModule, RouterLink],
  templateUrl: './notify.component.html',
  styleUrl: './notify.component.css',
})
export class NotifyComponent {
  @Input() data: {
    data: any;
    message: string;
    date: Date;
    id: number;
    isRead: boolean;
  } | undefined = undefined;
}
