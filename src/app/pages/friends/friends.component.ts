import { Component, inject, OnInit } from '@angular/core';
import { ProfileData, ProfileService } from '../../services/profile.service';
import { UserCardComponent } from '../../../common-ui/user-card/user-card.component';
import { SearchComponent } from '../../../common-ui/search/search.component';
import { FriendsService } from '../../services/friends.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-friends',
  imports: [UserCardComponent, SearchComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  constructor() {}

  profileService = inject(ProfileService);
  webSocketService = inject(WebSocketService);

  whatToShow = 'friends';

  authService = inject(AuthService);
  private friendsList: {
    list: ProfileData[];
  } = {
    list: [],
  };
  pendingRequests: {
    list: any[];
  } = {
    list: [],
  };

  private incomingReq$: ProfileData[] = [];
  private myReq$: ProfileData[] = [];
  private searchResults$: any = [];

  friendsService = inject(FriendsService);

  async ngOnInit(): Promise<void> {
    this.friendsService.getFriendsList((data: any) => {
      this.friendsList = data;
    });
    this.friendsService.getPendingRequests((data: any) => {
      this.pendingRequests = data;
      this.incomingReq$ = data.list.filter(
        (item: any) => item.sender_id.id !== this.authService.me.id
      );
      this.myReq$ = data.list.filter(
        (item: any) => item.receiver_id.id !== this.authService.me.id
      );
      console.log(data.list);
    });
    this.webSocketService.on('friends:newRequest', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.myReq$.push(data);
      } else {
        this.incomingReq$.push(data);
      }
    });
    this.webSocketService.on('friends:requestAccepted', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.myReq$ = this.myReq$.filter((item: any) => item.id != data.id);
        this.friends.list.push(data.receiver_id);
      } else {
        this.friends.list.push(data.sender_id);
        this.incomingReq$ = this.incomingReq$.filter(
          (item: any) => item.id != data.id
        );
      }
    });
    this.webSocketService.on('friends:requestCanceled', (data: any) => {
      if (data.sender_id.id === this.authService.me.id) {
        this.myReq$ = this.myReq$.filter((item: any) => item.id != data.id);
      } else {
        this.incomingReq$ = this.incomingReq$.filter(
          (item: any) => item.id != data.id
        );
      }
    });
  }
  onChange($event: any) {
    this.friendsService.getFriendsList((data: any) => {
      this.friendsList = data;
    });
    this.friendsService.getPendingRequests((data: any) => {
      this.pendingRequests = data;
      this.incomingReq$ = data.list.filter(
        (item: any) => item.sender_id.id !== this.authService.me.id
      );
      this.myReq$ = data.list.filter(
        (item: any) => item.receiver_id.id !== this.authService.me.id
      );
    });
    this.whatToShow = $event?.currentTarget?.value;
  }
  searchFriends(data: string) {
    if (!data) {
      this.whatToShow = 'friends';
      return;
    }
    this.whatToShow = 'search';
    this.profileService.getUsersStartsWith(data, (data: any[]) => {
      this.searchResults$ = data;
    });
  }
  get friends(): any {
    return this.friendsList;
  }
  get searchResults() {
    return this.searchResults$;
  }
  get myReq() {
    return this.myReq$;
  }
  get incomingReq() {
    return this.incomingReq$;
  }
}
