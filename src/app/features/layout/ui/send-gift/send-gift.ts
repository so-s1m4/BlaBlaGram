import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { FriendsService } from '@features/friends/data/friends.service';
import { Gifts } from '@features/layout/data/gifts';
import { Modal } from "@shared/common-ui/modal/modal";
import { SvgIconComponent } from '@shared/utils/svg.component';
import { ImgPipe } from "@utils/img.pipe";
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";

@Component({
  selector: 'app-send-gift',
  imports: [Modal, SvgIconComponent, CommonModule, ImgPipe, GlassEffectDirective],
  templateUrl: './send-gift.html',
  styleUrl: './send-gift.css'
})
export class SendGift implements OnInit {
  @Output() onClose = new EventEmitter();
  window = window;

  friendsService = inject(FriendsService)
  giftsService = inject(Gifts)
  authService = inject(AuthService)

  selectedUser: string | null = null;
  friendList:any[] = [];
  giftList:{list:any[]} = {list: []};

  stopPropagation(event: Event){
    event.stopPropagation()
  }
  close(){
    this.onClose.emit()
  }

  selectUser(id: string){
    this.selectedUser = id;
  }
  sendGift(giftId: string){
    if(!this.selectedUser) return;
    this.giftsService.send(giftId, this.selectedUser, "", false);
    this.close();
  }

  ngOnInit(){
    this.friendList = [ {...this.authService.me, username: "YOU"}, ...this.friendsService.data.friends.list];
    this.giftList = this.giftsService.gifts;
  }
}
