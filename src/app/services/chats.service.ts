import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  constructor() {}

  httpClient = inject(HttpClient);
  private apiUrl = 'https://api.example.com/chats'; // Replace with your actual API URL
  getChats() {
    return [
      {
        id: 1,
        profile: {
          id: 1,
          img: '/assets/img/avatar.webp',
          username: 'maksym',
        },
        lastMessage: {
          text: 'Hello from Chat 1',
          time: new Date(),
        },
      unreadMessages: 0,
      },
      {
        id: 2,
        profile: {
          id: 2,
          img: '/assets/img/avatar.webp',
          username: 'valentyn',
        },
        lastMessage: {
          text: 'Hello from Chat 2, this is a longer message to test the layout and see how it handles longer texts.',
          time: new Date(),
        },
        unreadMessages: 10000,
      },
      {
        id: 3,
        profile: { id: 3, img: '/assets/img/avatar.webp', username: 'jora' },
        lastMessage: {
          text: 'Hello from Chat 3',
          time: new Date(),
        },
        lastMessageTime: new Date(),
        unreadMessages: 5,
      },
    ];
    this.httpClient.get<any[]>(this.apiUrl);
  }

  getChatById(username: string): {} {
    return {
      id: 1,
      profile: {
        id: 1,
        img: '/assets/img/avatar.webp',
        username: username,
      },
      messages: [
        {
          id: 1,
          text: 'Hel lo from Chat 1',
          time: new Date(),
          sender: {
            id: 1,
            username: username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 2,
          text: 'How are you?',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 3,
          text: 'I am fine, thanks!',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 4,
          text: 'What about you?',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 5,
          text: 'I am doing great, thanks for asking!',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 6,
          text: 'Glad to hear that!',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 7,
          text: 'What are you up to these days?',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 8,
          text: 'Just working on some projects, you know how it is.',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 9,
          text: 'Yeah, I totally understand. Work can be quite demanding.',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 10,
          text: 'But it is also rewarding when you see the results of your efforts.',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 11,
          text: 'Absolutely! I love seeing my projects come to life.',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 12,
          text: 'Me too! It is a great feeling of accomplishment.',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },

        {
          id: 13,
          text: 'By the way, have you seen the latest updates in our field?',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 14,
          text: 'Yes, I have! There are some exciting new developments.',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 15,
          text: 'I know, right? It is an exciting time to be in this industry.',
          time: new Date(),
          sender: {
            id: 1,
            username,
            img: '/assets/img/avatar.webp',
          },
        },
        {
          id: 16,
          text: 'Definitely! I am looking forward to seeing how things evolve.',
          time: new Date(),
          sender: {
            id: 2,
            username: 'valentyn',
            img: '/assets/img/avatar.webp',
          },
        },
      ],
      unreadMessages: 0,
    };
  }

  async sendMessage(username: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      // Simulate sending a message
      console.log(`Message sent to chat ${username}: ${message}`);
      resolve();
    });
  }
}
