import { Component, inject, Input } from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { CommonModule } from '@angular/common';
import { CommentComponent } from '../comment/comment.component';
import { ImgPipe } from '../../app/utils/img.pipe';
import { CommentData } from '../comment/comment.component';
import { PostsService } from '../../app/services/posts.service';
import { ProfileService } from '../../app/services/profile.service';

export type PostData = {
  id: number;
  username: string;
  title: string;
  description: string;
  img: string | File;
  actions: {
    likes: number;
    reposts: number;
    isLiked: boolean;
    isReposted: boolean;
  };
  comments: {
    total: number;
    data: CommentData[];
  };
};

@Component({
  selector: 'app-post',
  imports: [SvgIconComponent, CommonModule, CommentComponent, ImgPipe],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  @Input() data: any;

  postsService = inject(PostsService);
  profileService = inject(ProfileService);

  showComments$ = false;

  get showComments() {
    return this.showComments$;
  }
  toggleShowComments() {
    this.showComments$ = !this.showComments$;
  }


  public likePost(event: Event) {
    this.data.actions.isLiked = !this.data.actions.isLiked;
    this.data.actions.likes += this.data.actions.isLiked ? 1 : -1;

    this.postsService
      .likePost(this.data.id)
      .then(() => {})
      .catch(() => {});
    event.stopPropagation();
  }

  async followUser(event: Event): Promise<void> {
    event.stopPropagation();
    await this.profileService.followUser(this.data.username).then((res) => {
      this.data.isFollowing = true;
    });
  }

  public sendComment(event: Event) {
    const commentInput = document.querySelector(
      `#comment-input-${this.data.id}`
    ) as HTMLInputElement;
    const commentText = commentInput.value.trim();

    if (commentText) {
      this.postsService
        .sendComment(this.data.id, commentText)
        .then((res) => {
          this.data.comments.data.push(res);
          this.data.comments.total++;
          commentInput.value = '';
        })
        .catch(() => {});
    }
    event.stopPropagation();
  }
}
