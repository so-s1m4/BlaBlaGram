import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ChatsService } from '@features/chats/data/chats.service';
import { FriendsService } from '@features/friends/data/friends.service';
import { ProfileService } from '@features/profile/data/profile.service';
import { ImgPipe } from '@shared/utils/img.pipe';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-create-modal',
  imports: [CommonModule, SvgIconComponent, ImgPipe],
  templateUrl: './create-space-pop-up-modal.html',
  styleUrl: './create-space-pop-up-modal.css',
})
export class CreateModalPopUp {
  AVAILABLE_TYPES = ['group', 'channel'];
  options = [
    {
      label: 'Create group',
      type: 'group',
      svg: 'group',
    },
    {
      label: 'Create channel',
      type: 'channel',
      svg: 'channel',
    },
  ];

  window = window;
  private readonly friendsService = inject(FriendsService);
  private readonly profileService = inject(ProfileService);
  router = inject(Router);

  friends = this.friendsService.friends;
  type: string = '';

  @Output() onClick = new EventEmitter();

  select(option: string) {
    if (this.AVAILABLE_TYPES.includes(option)) {
      console.log(option)
    } else {
      this.profileService.openChat(option, (data: any) => {
        this.onClick.emit()
        this.router.navigate(['/chats'], { queryParams: { id: data.chat.id } });
      });
    }
  }
}
