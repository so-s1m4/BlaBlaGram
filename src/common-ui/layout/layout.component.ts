import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { NotificationsComponent } from '../../app/pages/notifications/notifications.component';
import { CommonModule } from '@angular/common';
import { TitlebarComponent } from "../titlebar/titlebar.component";

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    SvgIconComponent,
    NotificationsComponent,
    CommonModule,
    TitlebarComponent
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  router: Router = inject(Router);

  pages = [
    { name: 'home', icon: 'home', title: 'Home page', isRoute: true },
    {
      name: 'notifications',
      icon: 'heart',
      title: 'News',
      isRoute: false,
      onclick: this.openNotifications.bind(this),
    },
    { name: 'chats', icon: 'chats', title: 'Messages', isRoute: true },
    { name: 'friends', icon: 'friends', title: 'Friends', isRoute: true },
    { name: 'profile', icon: 'person', title: 'Profile', isRoute: true },
  ];
  isCollapsed: boolean = false;
  showNotifications: boolean = false;
  openNotifications() {
    this.isCollapsed = !this.isCollapsed;
    this.showNotifications = !this.showNotifications;
  }
  window = window;

  ngOnInit(): void {
    // @ts-ignore
    console.log(this.window.isDesktop());
  }
}
