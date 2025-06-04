import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SvgIconComponent } from '../../app/utils/svg.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, SvgIconComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  router: Router = inject(Router);

  pages = [
    { name: 'home', icon: 'home', title: "Home" },
    { name: 'chats', icon: 'chats', title: "Chats" },
    { name: 'friends', icon: 'friends', title: "Friends" },
    { name: 'profile', icon: 'person', title: "Profile" },
  ];

}