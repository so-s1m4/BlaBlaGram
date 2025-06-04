import { Injectable } from '@angular/core';
import { PostData } from '../../common-ui/post/post.component';
import { CommentData } from '../../common-ui/comment/comment.component';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  httpClient: any;
  apiUrl: any;

  constructor() {}


  approvePost(postId: number): Promise<void> {
    // Simulate an API call to approve a post
    return new Promise((resolve) => {
      console.log(`Post with ID ${postId} approved.`);
      resolve();
    });
  }
  rejectPost(postId: number): Promise<void> {
    // Simulate an API call to reject a post
    return new Promise((resolve) => {
      console.log(`Post with ID ${postId} rejected.`);
      resolve();
    });
  }

  likePost(postId: number): Promise<void> {
    // Simulate an API call to like a post
    return new Promise((resolve) => {
      console.log(`Post with ID ${postId} liked.`);
      resolve();
    });
  }

  sendComment(postId: number, comment: string): Promise<CommentData> {
    return new Promise((resolve) => {
      console.log(`Comment sent for post with ID ${postId}: ${comment}`);
      resolve({
          id: Math.floor(Math.random() * 1000), // Simulate a comment ID
          text: comment,
          author: {
            username: 'currentUser', // Simulate the current user's username
            avatar: 'assets/img/avatar.png', // Simulate an avatar image
          },
          isLiked: false,
          createdAt: new Date().toISOString(), // Simulate the creation date
        }
      );
    });
  }

  likeComment(postId: number, commentId: number): Promise<void> {
    // Simulate an API call to like a comment
    return new Promise((resolve) => {
      console.log(`Comment with ID ${commentId} on post with ID ${postId} liked.`);
      resolve();
    })
  }

  getPostsForModeration() {
    return [
      {
        id: 1,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
      {
        id: 2,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
      {
        id: 3,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
    ];
  }

  createPost(
    payload: any
  ): Promise<PostData> {
    return new Promise((resolve) => {
      const newPost: PostData = {
        id: Math.floor(Math.random() * 1000), // Simulate a post ID
        ...payload,
        username: 'currentUser', // Simulate the current user's username
        img: payload.file,
        actions: {
          likes: 0,
          reposts: 0,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 0,
          data: [],
        },
      };
      console.log(`Post created:`, newPost);
      resolve(newPost);
    });
  }

  public async getPosts(username: string): Promise<PostData[] | []> {
    return [
      {
        id: 1,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
      {
        id: 2,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
      {
        id: 3,
        title: 'Post 1',
        description: 'Content of post 1',
        username: 'username',
        img: 'assets/img/post.png',
        actions: {
          likes: 300,
          reposts: 150,
          isLiked: false,
          isReposted: false,
        },
        comments: {
          total: 300,
          data: [],
        },
      },
    ];
  }
}
