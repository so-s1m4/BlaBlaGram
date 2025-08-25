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
import { ActivatedRoute, Event, ParamMap } from '@angular/router';
import { ImgPipe } from '@utils/img.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { SvgIconComponent } from '@utils/svg.component';
import { PhotoGalleryComponent } from './ui/photo-gallery/photo-gallery.component';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from 'app/app.component';
import { ChatsService } from '@features/chats/data/chats.service';
import { Modal } from '@shared/common-ui/modal/modal';
import { ProfileComponent } from '@features/profile/profile.component';
import { MediaPipe } from '../../../../shared/utils/media.pipe';
import { OnVisibleOnceDirective } from '@shared/utils/visibleOnce';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { AudioMessagePlayerComponent } from '../audio-message-player/audio-message-player.component';
import { AutoplayMutedDirective } from '@shared/utils/autoplayMuted';
import { FriendsService } from '@features/friends/data/friends.service';

@Component({
  selector: 'app-space-info',
  imports: [
    CommonModule,
    ImgPipe,
    ReactiveFormsModule,
    SvgIconComponent,
    PhotoGalleryComponent,
    Modal,
    ProfileComponent,
    ReactiveFormsModule,
    MediaPipe,
    OnVisibleOnceDirective,
    MediaPreviewComponent,
    AudioMessagePlayerComponent,
    AutoplayMutedDirective,
  ],
  templateUrl: './space-info.html',
  styleUrl: './space-info.css',
})
export class SpaceInfoComponent implements OnInit, OnDestroy {
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
    img: new FormControl(),
    title: new FormControl(),
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
