import { Component, inject, Input } from '@angular/core';
import {
  ProfileData,
  ProfileService,
} from '../../app/services/profile.service';
import { ImgPipe } from '../../app/utils/img.pipe';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-card',
  imports: [SvgIconComponent, ImgPipe, RouterLink],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() data: ProfileData | undefined;

  profileService = inject(ProfileService);

  ngOnInit() {
    if (!this.data) {
      console.error('UserCardComponent: data input is undefined');
    }
  } 

  removeFriend() {
    this.profileService.followUser(this.data!.username);
  }
}
