import { Component, inject, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts.service';
import { PostComponent } from '../../../common-ui/post/post.component';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-moderate',
  imports: [PostComponent], 
  templateUrl: './moderate.component.html',
  styleUrl: './moderate.component.css',
})
export class ModerateComponent implements OnInit {
  postsService = inject(PostsService);
  profileService = inject(ProfileService);
  private posts: any[] = [];

  constructor() {}
  ngOnInit(): void {
    this.posts = this.postsService.getPostsForModeration();
  }

  approvePost(postId: number): void {
    this.postsService.approvePost(postId).then(() => {
      this.posts = this.posts.filter((post: any) => post.id !== postId);
    });
  }
  rejectPost(postId: number): void {
    this.postsService.rejectPost(postId).then(() => {
      this.posts = this.posts.filter((post: any) => post.id !== postId);
    });
  }
  banUser(username: string): void {
    this.profileService.banUser(username).then(() => {
      this.posts = this.posts.filter((post: any) => post.username !== username);
    });
  }
  get getPosts() {
    return this.posts;
  }
}
