import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { NotificationsComponent } from '../../app/pages/notifications/notifications.component';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../app/services/web-socket.service';
import { ChatsService } from '../../app/services/chats.service';
import { PopupComponent } from '../popup/popup.component';
import { AuthService } from '../../app/services/auth.service';
import { FriendsService } from '../../app/services/friends.service';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    SvgIconComponent,
    NotificationsComponent,
    CommonModule,
    PopupComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  router: Router = inject(Router);

  webSocketService = inject(WebSocketService);
  chatsService = inject(ChatsService);
  authService = inject(AuthService);
  friendsService = inject(FriendsService);

  pages = [
    {
      name: 'home',
      icon: 'home',
      title: 'Home page',
      isRoute: true,
    },
    {
      name: 'notifications',
      icon: 'heart',
      title: 'News',
      isRoute: false,
      onclick: this.openNotifications.bind(this),
    },
    {
      name: 'chats',
      icon: 'chats',
      title: 'Messages',
      isRoute: true,
    },
    {
      name: 'friends',
      icon: 'friends',
      title: 'Friends',
      isRoute: true,
    },
    {
      name: 'profile',
      icon: 'person',
      title: 'Profile',
      isRoute: true,
    },
  ];
  isCollapsed: boolean = true;
  showNotifications: boolean = false;

  popUps: any[] = [];

  openNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  window = window;

  showPopUp(popUpData: any) {
    this.popUps.push(popUpData);
    setTimeout(() => {
      this.popUps.shift();
    }, 5000);
  }

  ngOnInit(): void {
    this.chatsService.chats();
    if (this.window.location.href.includes('chats')) {
    }
    this.webSocketService.on('communication:newMessage', (data: any) => {
      if (this.chatsService.currentChatId !== data.spaceId) {
        const popUpData = {
          type: 'newMessage',
          img: this.chatsService
            .chats()!
            .find((chat: any) => chat._id === data.spaceId).img,
          title:
            this.chatsService
              .chats()!
              .find((chat: any) => chat._id === data.spaceId)?.title ||
            'New Message',
          chatId: data.spaceId,
          message: data.text,
        };
        this.showPopUp(popUpData);
      }
    });
    this.webSocketService.on('friends:newRequest', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) return;
      const popUpData = {
        type: 'newRequest',
        img: data.sender_id.img,
        title: data.sender_id.username,
        message: data.text,
      };
      this.showPopUp(popUpData);
    });
    this.webSocketService.on('friends:requestAccepted', (data: any) => {
      if (data.receiver_id.id === this.authService.me.id) {
        return;
      }
      console.log(data.receiver_id);
      const popUpData = {
        type: 'acceptRequest',
        img: data.receiver_id.img,
        title: data.receiver_id.username,
        message: '',
      };
      this.showPopUp(popUpData);
    });
    this.webSocketService.on('friends:requestCanceled', (data: any) => {
      if (data.receiver_id.id === this.authService.me.id) {
        return;
      }
      const popUpData = {
        type: 'declineRequest',
        img: data.receiver_id.img,
        title: data.receiver_id.username,
        message: '',
      };
      this.showPopUp(popUpData);
    });

    this.webSocketService.on('friends:friendOnline', (data: any) => {
      this.friendsService.setFriendOnline(data.userId);
    });
    this.webSocketService.on('friends:friendOffline', (data: any) => {
      this.friendsService.setFriendOffline(data.userId);
    });

    window.addEventListener('pagehide', ()=>this.webSocketService.disconnect(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.webSocketService.disconnect();
      else this.webSocketService.connect(this.authService.token!)
    });
    window.addEventListener('beforeunload', ()=>this.webSocketService.disconnect());
  } 
}
