import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

import { BorderPipe } from '../../utils/border.pipe';
import { AuthService } from '../../services/auth.service';
import { API_URL } from '../../app.config';

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
    RouterLink,
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
    img: new FormControl<File | string | undefined>(undefined, []),
    name: new FormControl('Bla', [
      Validators.minLength(3),
      Validators.maxLength(64)
    ]),
    description: new FormControl('', [Validators.maxLength(512)]),
    password: new FormControl('', [Validators.minLength(3), Validators.maxLength(64)]),
  });
  window = window;

  constructor(private router: ActivatedRoute) {}

  private isMyProfile: boolean = false;
  private isEditing$: boolean = false;

  route: Router = inject(Router);
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  postsService = inject(PostsService);

  posts: PostData[] | undefined;

  data: any | null | undefined;

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

  // async createPost(event: Event): Promise<void> {
  //   event.preventDefault();

  //   if (this.createPostForm.invalid) {
  //     return;
  //   }
  //   if (this.createPostForm.valid) {
  //     const post = await this.postsService.createPost(
  //       this.createPostForm.value
  //     );
  //     this.posts?.unshift(post);
  //     this.createPostForm.reset();
  //   }
  // }

  editProfile(event: Event): void {
    event.preventDefault();
    this.isEditing$ = !this.isEditing$;
  }
  async onEditProfile(event: Event): Promise<void> {
    event.preventDefault();
    console.log('validate');

    // 1. validate
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    console.log('validated');

    // 2. build payload (FormData if you’re uploading a file)
    const { password, name, description } = this.editProfileForm.value;
    const body = new FormData();
    body.append('password', password!);
    body.append('name', name!);
    body.append('description', description!);

    // 3. send & subscribe
    this.profileService.editProfile(body).subscribe({
      next: (resp) => {
        // update your local data so the template reflects the changes
        this.data = {
          ...this.data,
          img: resp.data.img,
          name: resp.data.name,
          description: resp.data.description,
        };

        // patch the form so it stays in sync if you re-open
        this.editProfileForm.patchValue({
          name: resp.data.name,
          description: resp.data.description,
        });

        // finally close the editor
        this.isEditing$ = false;
      },
      error: (err) => {
        console.error('Failed to save profile', err);
        // maybe show a toast here
      },
    });
  }
  async onSelectBg(event: Event, bg: string): Promise<void> {
    event.preventDefault();
  }
  async onSelectBorder(event: Event, bg: string): Promise<void> {
    event.preventDefault();
  }
  ngOnInit() {
    // Subscribe to the paramMap and do everything inside its callback
    this.router.paramMap.subscribe((params) => {
      let userId = params.get('username');
      if (!userId) {
        // no username in URL → bail out
        this.route.navigate(['/']);
        return;
      }

      // decide if it’s “my” profile
      if (userId === 'me') {
        this.isMyProfile = true;
        userId = this.authService.me.id;
      } else {
        this.isMyProfile = false;
      }

      // now that we have a real userId, fetch the profile
      this.profileService.getProfile(userId).subscribe((resp: any) => {
        // patch the form first
        this.editProfileForm.patchValue({
          name: resp.data.name,
          description: resp.data.description || '',
        });

        // then store the data for the template
        this.data = {
          ...resp.data,
          border: 'border1.png',
          bg: 'bg1.avif',
        };

        console.log('loaded profile', this.data);
      });
    });
  }

  // profile.component.ts (inside ProfileComponent)
  trackByPost(index: number, post: PostData): number {
    return post.id;
  }

  get isItMyProfile(): boolean {
    return this.isMyProfile;
  }
  get isEditing(): boolean {
    return this.isEditing$;
  }
}
