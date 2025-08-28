import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ProfileData,
  ProfileService,
} from '@features/profile/data/profile.service';
import { ImgPipe } from '@utils/img.pipe';
import { SvgIconComponent } from '@utils/svg.component';
import { Router } from '@angular/router';
import { FriendsService } from '@features/friends/data/friends.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-card',
  imports: [SvgIconComponent, ImgPipe, CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent implements OnInit {
  clickEmit($event: Event) {
    $event.stopPropagation()
    this.onClick.emit(this.data.id);
  }
  @Output() onClick = new EventEmitter<string>();

  @Input() data: any | undefined;
  @Input() type: string = 'user';

  router = inject(Router);
  profileService = inject(ProfileService);
  friendsService = inject(FriendsService);

  isSent = false;
  isDeleted = false;

  ngOnInit() {
    if (!this.data) {
      console.error('UserCardComponent: data input is undefined');
    }
    this.data.isFriend = !!this.friendsService.data.friends.list.find(
      (item: any) => item.id == this.data.id
    );
  }
  openChat() {
    this.profileService.openChat(this.data.id, (data: any) => {
      this.router.navigate(['/chats',data.chat.id]);
    });
  }
  sendRequest() {
    const input = document.getElementById(
      'message-req-input'
    ) as HTMLInputElement;
    this.friendsService.sendRequest(this.data.id, input.value || 'Hello!');
    input.value = '';
    this.isSent = true;
  }
  removeFriend() {
    this.friendsService.delFriend(this.data.id);
  }
  acceptRequest() {
    this.friendsService.acceptRequest(this.data.id);
  }
  declineRequest() {
    this.friendsService.declineRequest(this.data.id);
  }
  deleteRequest() {
    this.isDeleted = true;
    this.friendsService.deleteRequest(this.data.id);
  }
}
