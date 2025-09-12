import { Component, inject, OnInit } from '@angular/core';
import {
  ProfileData,
  ProfileService,
} from '@features/profile/data/profile.service';
import { UserCardComponent } from './ui/user-card/user-card.component';
import { SearchComponent } from '@commonUI/search/search.component';
import { FriendsService } from '@features/friends/data/friends.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/web-socket.service';
import { Modal } from '@shared/common-ui/modal/modal';
import { ProfileComponent } from '@features/profile/profile.component';
import { CommonModule } from '@angular/common';
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";

@Component({
  selector: 'app-friends',
  imports: [
    UserCardComponent,
    SearchComponent,
    Modal,
    ProfileComponent,
    CommonModule,
    GlassEffectDirective
],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent {
  constructor() {}

  profileService = inject(ProfileService);
  webSocketService = inject(WebSocketService);

  whatToShow = 'friends';

  authService = inject(AuthService);
  friendsService = inject(FriendsService);

  readonly data = this.friendsService.data;
  private searchResults$: any = [];

  onChange($event: any) {
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
  get searchResults() {
    return this.searchResults$;
  }
  profileOf: string | undefined;
  closeInfo() {
    this.profileOf = undefined;
  }
  openProfileOf(id: string) {
    this.profileOf = id;
  }
  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
}
