import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProfileService } from './data/profile.service';
import { ImgPipe } from '@utils/img.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SvgIconComponent } from '@utils/svg.component';
import { GiftComponent } from './ui/gift/gift.component';
import { PhotoGalleryComponent } from './ui/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ImgPipe,
    ReactiveFormsModule,
    SvgIconComponent,
    GiftComponent,
    PhotoGalleryComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  data: any;
  isMyProfile: boolean = false;
  sub: any;

  selectedNav = 'Gifts';
  navPanel: any[] = [];
  showGallery = false;
  selectedPhoto = '';

  settingsFormGroup = new FormGroup({
    img: new FormControl<File | null>(null, []),
    name: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.maxLength(64),
    ]),
    bio: new FormControl<string>('', [Validators.maxLength(512)]),
    // birthday: new FormControl<string>(new Date().toISOString(), []),
    phone: new FormControl(null, []),
    email: new FormControl(null, [Validators.email]),

    password: new FormControl('', [Validators.minLength(8)]),
  });

  authService = inject(AuthService);
  profileService = inject(ProfileService);
  @ViewChild('label') label?: any;

  constructor(private route: ActivatedRoute) {}

  closePhotoGallery() {
    this.showGallery = false;
  }
  deletePhoto(path: string) {
    this.profileService.deletePhoto(path).subscribe((res) => {
      this.data.img = this.data.img.filter((item: any) => item.path !== path);
    });
  }
  openGallery(path: any) {
    this.selectedPhoto = path;
    this.showGallery = true;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.settingsFormGroup.invalid) {
      this.settingsFormGroup.markAllAsTouched();
      return;
    }

    const values = this.settingsFormGroup.value;
    const payload = new FormData();

    if (values.img) {
      payload.append('photo', values.img);
    }
    payload.append('name', values.name!);
    payload.append('description', values.bio! || 'about me!');
    // payload.append('birthday', values.birthday!);
    // payload.append('phone', values.phone! || "");
    // payload.append('email', values.email!);
    payload.append('password', values.password!);

    // 4) send to backend
    this.profileService.editProfile(payload).subscribe({
      next: (res) => {
        console.log('Settings saved', res);
      },
      error: (err) => {
        console.error('Save failed', err);
      },
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files![0];

    if (!file) {
      console.error('No file selected');
      this.label.nativeElement.style.backgroundImage = 'none';
      return;
    }

    const blobUrl = URL.createObjectURL(file);

    // Set it as the background
    this.label.nativeElement.style.backgroundImage = `url(${blobUrl})`;
    this.label.nativeElement.style.backgroundSize = 'cover';
    this.label.nativeElement.style.backgroundPosition = 'center';
  }
  changeTo(page: string) {
    this.selectedNav = page;
  }
  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params: ParamMap) => {
      let username = params.get('username')!;
      if (username == 'me') {
        this.isMyProfile = true;
        let data = this.authService.me;
        this.data = data;
        if (data.username == 's1m4') {
          this.data.gifts = [
            {
              url: 'https://46f32a42-e4ff-489b-8e03-b52e4d70fd18.selcdn.net/i/webp/15/21d26574dd8bc17df5035e5aa63a04.webp',
              from: {
                username: 'GOD',
                id: '777',
              },
              date: new Date('01-01-0001'),
              value: 777,
              text: 'Awarded for dying while coding this fucking website that will never be popular',
            },
            {
              url: 'https://46f32a42-e4ff-489b-8e03-b52e4d70fd18.selcdn.net/i/webp/5f/bdf882f6f33ec3983cb2afb8b3aae2.webp',
              from: {
                username: 'His girlfriend',
                id: '------',
              },
              date: new Date('09-16-2022'),
              value: 'unlimited',
              text: 'For the unlimited love that he has given her',
            },
          ];
        }
        this.settingsFormGroup.patchValue({
          name: data.name,
          bio: data.description,
          // birthday: data.birthday
          //   ? new Date(data.birthday).toISOString()
          //   : new Date().toISOString(),
          phone: data.phone,
          email: data.email,
        });
      } else {
        this.isMyProfile = false;
        this.profileService.getProfile(username).subscribe((res: any) => {
          let data = res.data;
          this.data = data;
          if (data.username == 's1m4') {
            this.data.gifts = [
              {
                url: 'https://46f32a42-e4ff-489b-8e03-b52e4d70fd18.selcdn.net/i/webp/15/21d26574dd8bc17df5035e5aa63a04.webp',
                from: {
                  username: 'GOD',
                  id: '777',
                },
                date: new Date('01-01-0001'),
                value: 777,
                text: 'Awarded for dying while coding this fucking website that will never be popular',
              },
              {
                url: 'https://46f32a42-e4ff-489b-8e03-b52e4d70fd18.selcdn.net/i/webp/5f/bdf882f6f33ec3983cb2afb8b3aae2.webp',
                from: {
                  username: 'His girlfriend',
                  id: '------',
                },
                date: new Date('09-16-2022'),
                value: 'unlimited',
                text: 'For the unlimited love that he has given her',
              },
            ];
          }
          this.data.img = this.data.img.reverse();
        });
      }
      this.navPanel = [
        {
          label: 'General',
          guard: true,
        },
        {
          label: 'Gifts',
          guard: true,
        },
        {
          label: 'Photos',
          guard: true,
        },
        {
          label: 'Posts',
          guard: true,
        },
        {
          label: 'Settings',
          guard: this.isMyProfile,
        },
      ];
    });
  }
}
