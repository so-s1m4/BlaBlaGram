import { Component } from '@angular/core';
import { PostComponent } from '../../../common-ui/post/post.component';

@Component({
  selector: 'app-home',
  imports: [PostComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  posts = [
    {
      id: 1,
      username: 'm0sk1tu4',
      title: 'Post Title',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui debitis facilis placeat obcaecati quis? Ipsa, officiis perferendis ea nobis exercitationem dignissimos quae nisi eligendi voluptatem. Vitae praesentium obcaecati suscipit repellendus. LoremLorem ipsum, dolor sit amet consectetur adipisicing elit. Qui debitis facilis placeat obcaecati quis? Ipsa, officiis perferendis ea nobis exercitationem dignissimos quae nisi eligendi voluptatem. Vitae praesentium obcaecati suscipit repellendus. LoremLorem ipsum, dolor sit amet consectetur adipisicing elit. Qui debitis facilis placeat obcaecati quis? Ipsa, officiis perferendis ea nobis exercitationem dignissimos quae nisi eligendi voluptatem. Vitae praesentium obcaecati suscipit repellendus. Lorem',
      img: 'assets/img/post.png',
      actions: {
        likes: 1000,
        reposts: 100,
        isLiked: false,
        isReposted: false,
      },

      comments: {
        total: 200,
        data: [
          {
            id: 1,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 2,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 1,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 2,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 1,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 2,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 1,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
          {
            id: 2,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
        ],
      },
    },
    {
      id: 3,
      username: 'm0sk1tu4',
      title: 'Post Title',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui debitis facilis placeat obcaecati quis? Ipsa, officiis perferendis ea nobis exercitationem dignissimos quae nisi eligendi voluptatem. Vitae praesentium obcaecati suscipit repellendus.',
      img: 'assets/img/post.png',
      actions: {
        likes: 1000,
        reposts: 100,
        isLiked: false,
        isReposted: false,
      },

      comments: {
        total: 200,
        data: [
          {
            id: 1,
            author: {
              username: 'm0sk1tu4',
              avatar: 'assets/img/avatar.webp',
            },
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.',
            date: '2023-10-01',
            isLiked: false,
          },
        ],
      },
    },
  ];
}
