import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FriendsService } from '@features/friends/data/friends.service';
import { ImgPipe } from '@shared/utils/img.pipe';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-create-modal',
  imports: [CommonModule, SvgIconComponent, ImgPipe],
  templateUrl: './create-modal.html',
  styleUrl: './create-modal.css',
})
export class CreateModal {
  options = [
    {
      label: 'Create group',
      type: 'group',
      svg: "group"
    },
    {
      label: 'Create channel',
      type: 'channel',
      svg: "channel"
    },
  ];

  private readonly friendsService = inject(FriendsService);
  friends = this.friendsService.friends
  type: string = '';

  setType(type: string) {}
}
