import { Component, inject, OnInit } from '@angular/core';
import { ProfileData, ProfileService } from '../../services/profile.service';
import { UserCardComponent } from '../../../common-ui/user-card/user-card.component';
import { SearchComponent } from '../../../common-ui/search/search.component';
import { FriendsService } from '../../services/friends.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-friends',
  imports: [UserCardComponent, SearchComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  
  constructor() {}

  profileService = inject(ProfileService);

  whatToShow = "friends";

  authService = inject(AuthService)
  private friendsList: ProfileData[] = [];
  private incomingReq$: ProfileData[] = [];
  private myReq$: ProfileData[] = [];
  private searchResults$: any = [];

  
  friendsService = inject(FriendsService);

  async ngOnInit(): Promise<void> {
    this.friendsService.getFriendsList((data: any) => {
      this.friendsList = data;
    });
    this.friendsService.getPendingRequests((data: any)=>{
      this.incomingReq$ = data.filter((item: any)=> item.sender_id.id !== this.authService.me);
      this.myReq$ = data.filter((item: any)=> item.sender_id.id === this.authService.me);

      console.log(this.incomingReq)
    });    
  }
  onChange($event: any){
    this.whatToShow = $event?.currentTarget?.value
  }
  searchFriends(data: string) {
    if (!data) {
      this.whatToShow = "friends";
      return;
    }
    this.whatToShow = "search"
    this.profileService.getUsersStartsWith(data, (data: any[])=>{
      this.searchResults$ = data;
    })
  }
  get friends(): ProfileData[] {
    return this.friendsList;
  }
  get searchResults(){
    return this.searchResults$;
  }
  get myReq(){
    return this.myReq$;
  }
  get incomingReq(){
    return this.incomingReq$;
  }
}
