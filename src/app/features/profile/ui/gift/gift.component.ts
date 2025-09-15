import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';
import { Modal } from "@shared/common-ui/modal/modal";
import { AuthService } from '@core/services/auth.service';
import { Gifts } from '@features/layout/data/gifts';

@Component({
  selector: 'app-gift',
  imports: [CommonModule, SvgIconComponent, Modal],
  templateUrl: './gift.component.html',
  styleUrl: './gift.component.css',
})
export class GiftComponent {
  @Input() data: any;
  showed = false;
  authService = inject(AuthService);
  giftService = inject(Gifts);
  open() {
    this.showed = true;
  }
  close() {
    this.showed = false;
  }

  sell(transactionId: string) {
    this.giftService.sell(transactionId)
    this.close();
  }
  stopPropagation(event: Event){
    event.stopPropagation()
  }
}
