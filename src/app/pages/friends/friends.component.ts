import { Component, inject, OnInit } from '@angular/core';
import { ProfileData, ProfileService } from '../../services/profile.service';
import { UserCardComponent } from '../../../common-ui/user-card/user-card.component';
import { SearchComponent } from '../../../common-ui/search/search.component';

@Component({
  selector: 'app-friends',
  imports: [UserCardComponent, SearchComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  searchFriends($event: Event) {
    throw new Error('Method not implemented.');
  }
  constructor() {}

  private friendsList: ProfileData[] = [];
  private pendingRequests: ProfileData[] = [];
  private blockedUsers: ProfileData[] = [];

  profileService = inject(ProfileService);

  async ngOnInit(): Promise<void> {
    this.profileService.getFriendsList((data: any) => {
      this.friendsList = data;
    });
    this.pendingRequests = await this.profileService.getPendingRequests();
    this.blockedUsers = await this.profileService.getBlockedUsers();
  }

  get friends(): ProfileData[] {
    return this.friendsList;
  }
}
