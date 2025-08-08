import { Component } from '@angular/core';
import { NotifyComponent } from '@commonUI/notify/notify.component';

@Component({
  selector: 'app-notifications',
  imports: [NotifyComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  notifications: any[] = [];
  loading: boolean = true;

  today: any[] = [];
  yesterday: any[] = [];
  thisWeek: any[] = [];

  async ngOnInit() {
    // Simulate fetching notifications
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const notifications = [
      {
        id: 1,
        message: 'New comment on your post',
        date: new Date('06-17-2025'),
        data: {
          type: 'comment',
          post: {
            id: 123,
            title: 'My first post',
            content: 'This is the content of my first post.',
            image: '/assets/img/post.png',
          },
          user: {
            id: 456,
            username: 'jonhdoe',
            avatar: '/assets/img/avatar.webp',
          },
          content: 'Great post! Thanks for sharing.',
        },
      },
      {
        id: 1,
        message: 'New comment on your post',
        date: new Date('06-17-2025'),
        data: {
          type: 'like',
          post: {
            id: 123,
            title: 'My first post',
            content: 'This is the content of my first post.',
            image: '/assets/img/post.png',
          },
          user: {
            id: 456,
            username: 'jonhdoe',
            avatar: '/assets/img/avatar.webp',
          },
        },
      },
      {
        id: 1,
        message: 'New comment on your post',
        date: new Date('06-17-2025'),
        data: {
          type: 'comment',
          post: {
            id: 123,
            title: 'My first post',
            content: 'This is the content of my first post.',
            image: '/assets/img/post.png',
          },
          user: {
            id: 456,
            username: 'jonhdoe',
            avatar: '/assets/img/avatar.webp',
          },
          content: 'Great post! Thanks for sharing.',
        },
      },
      {
        id: 4,
        message: 'New comment on your post',
        date: new Date('06-17-2025'),
        data: {
          type: 'comment',
          post: {
            id: 123,
            title: 'My first post',
            content: 'This is the content of my first post.',
            image: '/assets/img/post.png',
          },
          user: {
            id: 456,
            username: 'jonhdoe',
            avatar: '/assets/img/avatar.webp',
          },
          content: 'Great post! Thanks for sharing.',
        },
      },
      {
        id: 2,
        message: 'You have a new follower',
        date: new Date('06-16-2025'),
        data: {
          type: 'follow',
          user: {
            id: 456,
            username: 'jonhdoe',
            avatar: '/assets/img/avatar.webp',
          },
        },
      },
    ];

    this.today = notifications
      .filter((n) => n.date.toDateString() === new Date().toDateString())
      .map((n) => {
        return { ...n, isRead: false };
      });
    this.yesterday = notifications
      .filter(
        (n) =>
          n.date.toDateString() ===
          new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
      )
      .map((n) => {
        return { ...n, isRead: true };
      });
    this.thisWeek = notifications
      .filter(
        (n) =>
          n.date >= new Date(new Date().setDate(new Date().getDate() - 7)) &&
          n.date < new Date(new Date().setDate(new Date().getDate() - 1))
      )
      .map((n) => {
        return { ...n, isRead: false };
      });
    this.loading = false;
  }
}
