import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ProfileData = {
  id: number;
  name: string;
  username: string;
  img: string;
  description: string;
  bg: string;
  border: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  httpClient = inject(HttpClient);
  private apiUrl = 'https://api.example.com/';
  constructor() {}

  public async getProfile(userId: string | null): Promise<ProfileData | null> {
    if (!userId) {
      return null;
    }
    if (userId === 'me') {
      return {
        id: 2,
        name: 'John Doe3',
        username: 'johndoe',
        img: 'assets/img/avatar.webp',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bg: 'bg1.avif',
        border: 'border1.png',
      };
    } else {
      return {
        id: 1,
        name: 'Anastasia Sipos',
        username: 'hexe666',
        img: 'assets/img/avatar.webp',
        description: 'HAHAHA, mach ein profile über mich! :D',
        bg: 'bg1.avif',
        border: 'border1.png',
      };
    }
  }

  banUser(username: string): Promise<void> {
    // Simulate an API call to ban a user
    return new Promise((resolve) => {
      console.log(`User ${username} has been banned.`);
      resolve();
    });
  }

  unbanUser(username: string): Promise<void> {
    // Simulate an API call to unban a user
    return new Promise((resolve) => {
      console.log(`User ${username} has been unbanned.`);
      resolve();
    });
  }

  followUser(username: string): Promise<void> {
    // Simulate an API call to follow a user
    return new Promise((resolve) => {
      console.log(`You are now following ${username}.`);
      resolve();
    });
  }

  async getFriendsList(): Promise<ProfileData[]> {
    return [
      {
        id: 1,
        name: 'SomeBody',
        username: 'Doaosdja',
        img: 'assets/img/avatar.webp',
        description: 'akljsdb jgasdhg vahgsdv havshgd h',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 2,
        name: 'John Doe',
        username: 'johndoe',
        img: 'assets/img/avatar.webp',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 3,
        name: 'Jane Smith',
        username: 'janesmith',
        img: 'assets/img/avatar.webp',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 1,
        name: 'SomeBody',
        username: 'Doaosdja',
        img: 'assets/img/avatar.webp',
        description: 'akljsdb jgasdhg vahgsdv havshgd h',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 666,
        name: 'Anastasia',
        username: 'Sipos',
        img: 'assets/img/avatar.webp',
        description: 'HAHAHA, mach ein profile über mich! :D',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 2,
        name: 'John Doe',
        username: 'johndoe',
        img: 'assets/img/avatar.webp',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 3,
        name: 'Jane Smith',
        username: 'janesmith',
        img: 'assets/img/avatar.webp',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 1,
        name: 'SomeBody',
        username: 'Doaosdja',
        img: 'assets/img/avatar.webp',
        description: 'akljsdb jgasdhg vahgsdv havshgd h',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 2,
        name: 'John Doe',
        username: 'johndoe',
        img: 'assets/img/avatar.webp',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 3,
        name: 'Jane Smith',
        username: 'janesmith',
        img: 'assets/img/avatar.webp',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
    ];
  }
  async getPendingRequests(): Promise<ProfileData[]> {
    return [
      {
        id: 4,
        name: 'Alice Johnson',
        username: 'alicejohnson',
        img: 'assets/img/avatar.webp',
        description:
          'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 5,
        name: 'Bob Brown',
        username: 'bobbrown',
        img: 'assets/img/avatar.webp',
        description:
          'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 6,
        name: 'Charlie Green',
        username: 'charliegreen',
        img: 'assets/img/avatar.webp',
        description:
          'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
    ];
  }
  async getBlockedUsers(): Promise<ProfileData[]> {
    return [
      {
        id: 7,
        name: 'David White',
        username: 'davidwhite',
        img: 'assets/img/avatar.webp',
        description:
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 8,
        name: 'Eve Black',
        username: 'eveblack',
        img: 'assets/img/avatar.webp',
        description:
          'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
      {
        id: 9,
        name: 'Frank Blue',
        username: 'frankblue',
        img: 'assets/img/avatar.webp',
        description:
          'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.',
        bg: 'bg1.avif',
        border: 'border1.png',
      },
    ];
  }
}
