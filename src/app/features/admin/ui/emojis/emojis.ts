import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';
import { Modal } from '@shared/common-ui/modal/modal';
import { EmojiDetails } from './ui/emoji-details/emoji-details';
import { GiftCreate } from './ui/emoji-create/emoji-create';

@Component({
  selector: 'app-emojis',
  imports: [
    GlassEffectDirective,
    SvgIconComponent,
    Modal,
    GiftCreate,
    CommonModule,
    EmojiDetails
  ],
  templateUrl: './emojis.html',
  styleUrl: './emojis.css',
})
export class Emojis {
  emojiIdForEdit: string | 'create' | null = null;

  readonly emojisData = inject(AdminService).emojisData;

  click(emojiId: string | 'create' | null) {
    console.log(emojiId);
    this.emojiIdForEdit = emojiId;
  }
}
