import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { PostComponent } from '../../../common-ui/post/post.component';
import { ProfileService } from '../../services/profile.service';
import { PostData } from '../../../common-ui/post/post.component';
import { PostsService } from '../../services/posts.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImgPipe } from '../../utils/img.pipe';
import { BgPipe } from '../../utils/bg.pipe';
import { SvgIconComponent } from '../../utils/svg.component';

import { profileBackgrounds, profileBorders } from '../../../main';

import { ProfileData } from '../../services/profile.service';
import { BorderPipe } from '../../utils/border.pipe';

@Component({
  selector: 'app-profile',
  imports: [
    PostComponent,
    ReactiveFormsModule,
    CommonModule,
    ImgPipe,
    SvgIconComponent,
    BgPipe,
    BorderPipe,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  backgrounds: string[] = profileBackgrounds;
  borders: string[] = profileBorders;

  createPostForm = new FormGroup({
    file: new FormControl<File | null | undefined>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required]),
  });

  editProfileForm = new FormGroup({
    img: new FormControl<File | null | undefined>(undefined, [
      Validators.required,
    ]),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required]),
  });
  window = window;

  constructor(private router: ActivatedRoute) {}

  private isMyProfile: boolean = false;
  private isEditing$: boolean = false;

  route: Router = inject(Router);
  profileService = inject(ProfileService);
  postsService = inject(PostsService);

  posts: PostData[] | undefined;

  data: ProfileData | null | undefined;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files![0];

    if (!file) {
      console.error('No file selected');
      input.style.backgroundImage = 'none';
      return;
    }

    const blobUrl = URL.createObjectURL(file);

    // Set it as the background
    input.style.backgroundImage = `url(${blobUrl})`;
    input.style.backgroundSize = 'cover';
    input.style.backgroundPosition = 'center';
  }

  async createPost(event: Event): Promise<void> {
    event.preventDefault();

    if (this.createPostForm.invalid) {
      return;
    }
    if (this.createPostForm.valid) {
      const post = await this.postsService.createPost(
        this.createPostForm.value
      );
      this.posts?.unshift(post);
      this.createPostForm.reset();
    }
  }

  editProfile(event: Event): void {
    event.preventDefault();
    this.isEditing$ = !this.isEditing$;
  }
  async onEditProfile(event: Event): Promise<void> {
    event.preventDefault();
    this.isEditing$ = false;
  }
  async onSelectBg(event: Event, bg: string): Promise<void> {
    event.preventDefault();
  }
  async onSelectBorder(event: Event, bg: string): Promise<void> {
    event.preventDefault();
  }

  async ngOnInit(): Promise<void> {
    let userId: string | null = '';
    this.router.paramMap.subscribe((params) => {
      userId = params.get('username');
      console.log(userId);
    });
    if (!userId) {
      this.route.navigate(['/']);
    }
    if (userId === 'me') {
      this.isMyProfile = true;
    } else {
      this.isMyProfile = false;
    }
    this.data = await this.profileService.getProfile(userId).then((data) => {
      this.editProfileForm.patchValue({
        name: data!.name,
        description: data!.description,
      });
      return data;
    });
    this.posts = await this.postsService.getPosts(userId);
  }

  get isItMyProfile(): boolean {
    return this.isMyProfile;
  }
  get isEditing(): boolean {
    return this.isEditing$;
  }
}
