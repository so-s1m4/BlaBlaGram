import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  Input,
} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProfileService } from './data/profile.service';
import { ImgPipe } from '@utils/img.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { SvgIconComponent } from '@utils/svg.component';
import { GiftComponent } from './ui/gift/gift.component';
import { PhotoGalleryComponent } from './ui/photo-gallery/photo-gallery.component';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from 'app/app.component';
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";

interface Gift {
  url: string;
  from: { username: string; id: string };
  date: Date;
  value: number | string;
  text: string;
}

interface ProfileData {
  username: string;
  name: string;
  description?: string;
  phone?: string | null;
  email?: string | null;
  img: { path: string }[];
  isOnline: boolean;
  gifts?: Gift[];
  [key: string]: any; // fallback for unknown fields coming from API
}

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ImgPipe,
    ReactiveFormsModule,
    SvgIconComponent,
    GiftComponent,
    PhotoGalleryComponent,
    GlassEffectDirective
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() username: string | undefined = undefined;

  data!: ProfileData | null;
  isMyProfile = false;

  selectedNav: 'Gifts' | 'Photos' | 'Posts' | 'Settings' = 'Photos';
  navPanel: { label: string; guard: boolean }[] = [];
  showGallery = false;
  selectedPhoto = '';

  settingsFormGroup: FormGroup<{
    img: FormControl<File | null>;
    name: FormControl<string | null>;
    bio: FormControl<string | null>;
    phone: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    primaryColor: FormControl<string>;
  }>;

  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly appComponent = inject(AppComponent);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('label') label?: ElementRef<HTMLElement>;

  constructor(private fb: FormBuilder) {
    this.settingsFormGroup = this.fb.nonNullable.group({
      img: new FormControl<File | null>(null),
      name: new FormControl<string | null>('', [
        Validators.minLength(3),
        Validators.maxLength(64),
      ]),
      bio: new FormControl<string | null>('', [Validators.maxLength(512)]),
      phone: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null, [Validators.email]),
      password: new FormControl<string | null>('', [Validators.minLength(8)]),
      primaryColor: new FormControl<string>(
        localStorage.getItem('mainColor') || '',
        []
      ),
    }) as unknown as ProfileComponent['settingsFormGroup'];
  }

  ngOnInit(): void {
    if (this.username) {
      this.loadProfile(this.username);
      return;
    }
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        const username = params.get('username');
        if (!username) return;
        this.loadProfile(username);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  changeTo(page: string) {
    // narrow to allowed tabs only
    if (['General', 'Gifts', 'Photos', 'Posts', 'Settings'].includes(page)) {
      this.selectedNav = page as typeof this.selectedNav;
    }
  }

  openGallery(path: string) {
    this.selectedPhoto = path;
    this.showGallery = true;
  }
  closePhotoGallery() {
    this.showGallery = false;
  }
  deletePhoto(path: string) {
    this.profileService
      .deletePhoto(path)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.data?.img) {
          this.data.img = this.data.img.filter((item) => item.path !== path);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    console.log(file)

    if (!file) {
      if (this.label?.nativeElement) {
        this.renderer.setStyle(
          this.label.nativeElement,
          'backgroundImage',
          'none'
        );
      }
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    if (this.label?.nativeElement) {
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundImage',
        `url(${blobUrl})`
      );
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundSize',
        'cover'
      );
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundPosition',
        'center'
      );
    }

    // keep file in form for submit
    this.settingsFormGroup.patchValue({ img: file });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.settingsFormGroup.invalid) {
      this.settingsFormGroup.markAllAsTouched();
      return;
    }

    const values = this.settingsFormGroup.value;
    const payload = new FormData();
    const file = this.settingsFormGroup.get('img')?.value;
    if (file) {
      payload.append('photo', file, file.name);
    }
    if (values.name) payload.append('name', values.name);
    payload.append('description', values.bio || 'about me!');
    if (values.password) payload.append('password', values.password);
    // if (values.phone) payload.append('phone', values.phone);
    // if (values.email) payload.append('email', values.email);
    this.appComponent.changeMainColor(values.primaryColor!);

    this.data = null;

    this.profileService
      .editProfile(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          window.location.reload()
        },
        error: (err) => {
          console.error('Save failed', err);
        },
      });
  }
  resetMainColor(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.appComponent.resetMainColor();
  }

  logout() {
    this.authService.logout();
  }
  private loadProfile(username: string) {
    if (username === 'me') {
      this.isMyProfile = true;
      const me = this.authService.me as ProfileData;
      this.data = { ...me };

      this.patchFormFromData(this.data);
      this.buildNavPanel();
      return;
    }

    this.isMyProfile = false;
    this.profileService
      .getProfile(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const profile: ProfileData = res.data;
        this.data = { ...profile };
        if (this.data.img) {
          this.data.img = [...this.data.img].reverse();
        }
        this.buildNavPanel();
      });
  }
  private patchFormFromData(data: ProfileData) {
    this.settingsFormGroup.patchValue({
      name: data.name ?? '',
      bio: data.description ?? '',
      phone: data.phone ?? null,
      email: data.email ?? null,
      // password intentionally not prefilled
    });
  }
  private buildNavPanel() {
    this.navPanel = [
      { label: 'Gifts', guard: true },
      { label: 'Photos', guard: true },
      // { label: 'Posts', guard: true },
      { label: 'Settings', guard: this.isMyProfile },
    ];
  }
}
