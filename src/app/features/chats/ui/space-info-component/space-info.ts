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
  Output,
  EventEmitter,
} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ImgPipe } from '@utils/img.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { SvgIconComponent } from '@utils/svg.component';
import { ChatsService } from '@features/chats/data/chats.service';
import { Modal } from '@shared/common-ui/modal/modal';
import { ProfileComponent } from '@features/profile/profile.component';
import { MediaPipe } from '../../../../shared/utils/media.pipe';
import { OnVisibleOnceDirective } from '@shared/utils/visibleOnce';
import { AutoplayMutedDirective } from '@shared/utils/autoplayMuted';
import { FriendsService } from '@features/friends/data/friends.service';

@Component({
  selector: 'app-space-info',
  imports: [
    CommonModule,
    ImgPipe,
    ReactiveFormsModule,
    SvgIconComponent,
    Modal,
    ProfileComponent,
    ReactiveFormsModule,
    MediaPipe,
    OnVisibleOnceDirective,
    AutoplayMutedDirective,
  ],
  templateUrl: './space-info.html',
  styleUrl: './space-info.css',
})
export class SpaceInfoComponent implements OnInit, OnDestroy {
  @ViewChild('label') label: any;

  private readonly renderer = inject(Renderer2);

  inputImg($event: globalThis.Event) {
    throw new Error('Method not implemented.');
  }
  @Input() id: string = '';
  @Output() showInChat = new EventEmitter<string>();

  private readonly chatsService = inject(ChatsService);

  selectedNav: 'Media' | 'Members' | 'Files' | 'Voice' | 'Settings' = 'Members';
  navPanel: { label: string; guard: () => boolean }[] = [];

  data: any = undefined;
  showProfile = '';
  showAddMemberModal = false;
  showEditMemberModal: any = {};
  filterName = '';

  friendsService = inject(FriendsService);
  authService = inject(AuthService);
  friends: any = [];

  settingsForm = new FormGroup({
    img: new FormControl<File | null>(null),
    title: new FormControl<string>(this.data?.title),
    description: new FormControl(),
  });
  JSON = JSON;

  loadSRCforMedia(element: any, media: any, type: 'media' | 'img') {
    if (type == 'media') element.src = `${new MediaPipe().transform(media)}`;
    else element.src = `${new ImgPipe().transform(media)}`;
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
  filterNames($event: any) {
    this.filterName = ($event.currentTarget as HTMLInputElement).value;
  }
  addMembers() {
    const members = this.friends
      .filter((it: any) => it.selected)
      .map((it: any) => it.id);
    this.showAddMemberModal = false;
    this.chatsService.addMembersToSpace(
      this.data.type,
      this.data.id,
      members,
      (data: any) => {
        this.data.group.members.push(
          ...data.map((item: any) => ({ role: 'member', user: item }))
        );
        this.data.memberCount += data.length;
      }
    );
  }
  removeMember(userId: any) {
    this.showEditMemberModal = {};
    this.chatsService.delMembersFromSpace(
      this.data.type,
      this.data.id,
      [userId],
      () => {
        this.data.group.members = this.data.group.members.filter(
          (item: any) => item.user.id != userId
        );
        this.data.memberCount -= 1;
      }
    );
  }
  promoteMember(userId: any) {
    this.showEditMemberModal = {};
    this.chatsService.promoteMemberInSpace(this.data.id, userId, () => {
      this.data.group.members.find((item: any) => item.user.id == userId).role =
        'admin';
    });
  }
  degradeMember(userId: any) {
    this.showEditMemberModal = {};
    this.chatsService.degradeMemberInSpace(this.data.id, userId, () => {
      this.data.group.members.find((item: any) => item.user.id == userId).role =
        'member';
    });
  }

  onFileSelect($event: any) {
    const input = $event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

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
    this.settingsForm.patchValue({ img: file });
  }
  onSaveSettings(event: Event) {
    event.preventDefault();
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }
    const values = this.settingsForm.value;
    const payload = new FormData();
    const file = this.settingsForm.get('img')?.value;
    if (file) {
      payload.append('photo', file, file.name);
    }
    if (values.title) payload.append('title', values.title);

    // payload.append('description', values.description || '');
    this.chatsService.patchSpace(
      'group',
      this.data.id,
      payload,
      (data: any) => {
        this.data = {
          ...this.data,
          ...data.data,
        };
      }
    );
  }

  changeTo(page: string) {
    // narrow to allowed tabs only
    if (['Media', 'Members', 'Files', 'Voice', 'Settings'].includes(page)) {
      this.selectedNav = page as typeof this.selectedNav;
    }
  }
  private buildNavPanel() {
    this.navPanel = [
      { label: 'Media', guard: () => true },
      { label: 'Members', guard: () => true },
      { label: 'Files', guard: () => true },
      { label: 'Voice', guard: () => true },
      {
        label: 'Settings',
        guard: () => {
          return this.data.role == 'admin';
        },
      },
    ];
  }
  ngOnInit(): void {
    this.chatsService.getInfoAboutChat(this.id, (data: any) => {
      this.data = data;
      this.settingsForm.patchValue({
        title: data.title,
        description: data.description || '',
      });
      this.friends = this.friendsService.friends.list
        .filter(
          (item) =>
            !this.data.group.members.find((it: any) => it.user.id == item.id)
        )
        .map((item) => ({ ...item, selected: false }));
    });
    this.buildNavPanel();
  }
  ngOnDestroy(): void {}
}
