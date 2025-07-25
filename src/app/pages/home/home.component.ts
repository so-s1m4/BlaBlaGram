import { Component } from '@angular/core';
import { PostComponent } from '../../../common-ui/post/post.component';

@Component({
  selector: 'app-home',
  imports: [PostComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  posts: any[] = [];
}
