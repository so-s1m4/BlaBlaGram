import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { FriendsService } from '@features/friends/data/friends.service';
import { Modal } from "@shared/common-ui/modal/modal";
import { SvgIconComponent } from '@shared/utils/svg.component';
import { ImgPipe } from "@utils/img.pipe";

@Component({
  selector: 'app-send-gift',
  imports: [Modal, SvgIconComponent, CommonModule, ImgPipe],
  templateUrl: './send-gift.html',
  styleUrl: './send-gift.css'
})
export class SendGift implements OnInit {
  @Output() onClose = new EventEmitter();
  window = window;

  friendsService = inject(FriendsService)
  authService = inject(AuthService)

  selectedUser: string | null = null;
  friendList:any[] = [];
  giftList:any[] = []

  stopPropagation(event: Event){
    event.stopPropagation()
  }
  close(){
    this.onClose.emit()
  }

  selectUser(id: string){
    this.selectedUser = id;
  }

  ngOnInit(){
    this.friendList = [ {...this.authService.me, username: "YOU"}, ...this.friendsService.friends.list];
  }
}
