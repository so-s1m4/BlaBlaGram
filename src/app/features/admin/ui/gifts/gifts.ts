import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';
import { Modal } from '@shared/common-ui/modal/modal';
import { GiftDetails } from './ui/gift-details/gift-details';
import { GiftCreate } from './ui/gift-create/gift-create';

@Component({
  selector: 'app-gifts',
  imports: [
    GlassEffectDirective,
    SvgIconComponent,
    Modal,
    GiftDetails,
    GiftCreate,
    CommonModule,
  ],
  templateUrl: './gifts.html',
  styleUrl: './gifts.css',
})
export class Gifts {
  giftIdForEdit: string | 'create' | null = null;

  readonly giftsData = inject(AdminService).giftsData;

  click(giftId: string | 'create' | null) {
    console.log(giftId);
    this.giftIdForEdit = giftId;
  }
}
