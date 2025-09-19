import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SvgIconComponent } from '@utils/svg.component';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '@core/services/web-socket.service';
import { ChatsService } from '@features/chats/data/chats.service';
import { PopupComponent } from '@commonUI/popup/popup.component';
import { AuthService } from '@services/auth.service';
import { FriendsService } from '@features/friends/data/friends.service';
import { SendGift } from './ui/send-gift/send-gift';
import { Modal } from '@shared/common-ui/modal/modal';
import { ProfileComponent } from '@features/profile/profile.component';
import { Gifts } from './data/gifts';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    SvgIconComponent,
    CommonModule,
    PopupComponent,
    SendGift,
    Modal,
    ProfileComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
  router: Router = inject(Router);

  webSocketService = inject(WebSocketService);
  chatsService = inject(ChatsService);
  authService = inject(AuthService);
  friendsService = inject(FriendsService);

  pages = [
    {
      name: 'gifts',
      icon: 'gift',
      title: 'Send gift',
      isRoute: false,
      onclick: this.toggleSendGift.bind(this),
    },
    {
      name: 'friends',
      icon: 'friends',
      title: 'Friends',
      isRoute: true,
      counter: () => {
        return this.friendsService.data.requests.incoming.length;
      },
    },
    {
      name: 'chats',
      icon: 'chats',
      title: 'Messages',
      isRoute: true,
      counter: () => {
        return this.chatsService.chats.list
          .map((item: any) => item.lastMessage?.seq - item.lastReadMessageSeq)
          .reduce((partialSum, a) => partialSum + a, 0);
      },
    },
    {
      name: 'profile',
      icon: 'person',
      title: 'Profile',
      isRoute: false,
      onclick: this.toggleShowProfile.bind(this),
    },
    {
      name: 'admin',
      icon: 'hex',
      title: 'Admin',
      isRoute: true,
      guard: () => this.authService.me.role === 'admin',
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

  showSendGift = false;
  showProfile = false;

  toggleSendGift() {
    this.showSendGift = !this.showSendGift;
  }
  toggleShowProfile() {
    this.showProfile = !this.showProfile;
  }

  ngOnInit(): void {
    this.webSocketService.on('communication:newMessage', (data: any) => {
      if (this.chatsService.currentChat.id !== data.spaceId) {
        const popUpData = {
          type: 'newMessage',
          img: data.sender.img[data.sender.img.length - 1],
          title: data.sender.username || 'New Message',
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
        img: data.sender_id.img[data.sender_id.img.length - 1],
        title: data.sender_id.username,
        message: data.text,
      };
      this.showPopUp(popUpData);
    });
    this.webSocketService.on('friends:requestAccepted', (data: any) => {
      if (data.receiver_id.id === this.authService.me.id) {
        return;
      }
      const popUpData = {
        type: 'acceptRequest',
        img: data.receiver_id.img[data.receiver_id.img.length - 1],
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
        img: data.receiver_id.img[data.receiver_id.img.length - 1],
        title: data.receiver_id.username,
        message: '',
      };
      this.showPopUp(popUpData);
    });
    this.webSocketService.on('gifts:sold', (data: any) => {
      const giftIndex = this.authService.me.gifts.findIndex(
        (gift: any) => gift.tid === data.tid
      );
      if (giftIndex !== -1) {
        this.authService.me.currency +=
          this.authService.me.gifts[giftIndex].gift.value * 0.75;
        this.authService.me.gifts.splice(giftIndex, 1);
      }
    });
    this.webSocketService.on('gifts:receive', (data: any) => {
      console.log(data);
      this.authService.me.gifts.push(data);
    });
  }
}
