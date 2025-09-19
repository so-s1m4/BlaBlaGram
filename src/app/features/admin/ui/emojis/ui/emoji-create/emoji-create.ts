import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-emoji-create',
  imports: [ReactiveFormsModule, GlassEffectDirective, SvgIconComponent],
  templateUrl: './emoji-create.html',
  styleUrl: './emoji-create.css',
})
export class GiftCreate {
  adminService = inject(AdminService);

  @Output() readonly close = new EventEmitter<void>();
  Object = Object;
  URL = URL;

  emojiForm = new FormGroup<any>({
    url: new FormControl(''),
    name: new FormControl(''),
  });

  constructor() {}

  preventDefault(event: Event) {
    event.stopPropagation();
  }
  save() {
    this.adminService
      .createEmoji(this.emojiForm.value)
      .subscribe((data: any) => {
        this.close.emit();
        window.location.reload();
      });
  }
}
