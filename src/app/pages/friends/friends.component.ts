import { Component, inject, OnInit } from '@angular/core';
import { ProfileData, ProfileService } from '../../services/profile.service';
import { FriendCardComponent } from '../../../common-ui/friend-card/friend-card.component';

@Component({
  selector: 'app-friends',
  imports: [FriendCardComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  constructor() {}

  private friendsList: ProfileData[] = [];
  private pendingRequests: ProfileData[] = [];
  private blockedUsers: ProfileData[] = [];

  profileService = inject(ProfileService);

  async ngOnInit(): Promise<void> {
    this.friendsList = await this.profileService.getFriendsList();
    this.pendingRequests = await this.profileService.getPendingRequests();
    this.blockedUsers = await this.profileService.getBlockedUsers();
  }

  get friends(): ProfileData[] {
    return this.friendsList;
  }
}
