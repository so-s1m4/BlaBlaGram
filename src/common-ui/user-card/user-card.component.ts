import { Component, inject, Input, OnInit } from '@angular/core';
import {
  ProfileData,
  ProfileService,
} from '../../app/services/profile.service';
import { ImgPipe } from '../../app/utils/img.pipe';
import { SvgIconComponent } from '../../app/utils/svg.component';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FriendsService } from '../../app/services/friends.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-card',
  imports: [SvgIconComponent, ImgPipe, RouterLink, CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent implements OnInit {
  @Input() data: any | undefined;
  @Input() type: string = "user";



  router = inject(Router)
  profileService = inject(ProfileService);
  friendsService = inject(FriendsService);

  ngOnInit() {
    if (!this.data) {
      console.error('UserCardComponent: data input is undefined');
    }
    this.data.isFriend = !!(this.friendsService.friends).find((item: any)=> item.id == this.data.id)
  } 

  openChat(userId: string) {
    this.profileService.openChat(userId, (data: any) => {
      this.router.navigate(['/chats'], { queryParams: { id: data._id } });
    });
  }
  sendRequest(){
    const input = document.getElementById("message-req-input") as HTMLInputElement
    this.friendsService.sendRequest(this.data.id, input.value)
  }

  removeFriend() {
    
  }
  acceptRequest(){
    this.friendsService.acceptRequest(this.data.id)
  }
  declineRequest(){
    this.friendsService.declineRequest(this.data.id)
  }
}
