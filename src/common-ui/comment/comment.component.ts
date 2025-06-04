import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { CommonModule } from '@angular/common';

export type CommentData = {
  id: number;
  author: {
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  isLiked: boolean;
};


@Component({
  selector: 'app-comment',
  imports: [SvgIconComponent, CommonModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() data: any;

  onClick() {
    this.data.isLiked = !this.data.isLiked;
  }
}
