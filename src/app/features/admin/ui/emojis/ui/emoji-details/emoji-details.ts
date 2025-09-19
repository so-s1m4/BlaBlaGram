import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-emoji-details',
  imports: [ReactiveFormsModule, GlassEffectDirective, SvgIconComponent],
  templateUrl: './emoji-details.html',
  styleUrl: './emoji-details.css',
})
export class EmojiDetails {
  @Input() emojiId!: string;
  @Output() readonly close = new EventEmitter<void>();

  adminService = inject(AdminService);

  Object = Object;
  URL = URL;

  emojiForm = new FormGroup<any>({});

  constructor(private httpClient: HttpClient) {}
  emoji: any = null;

  ngOnInit() {
    this.httpClient
      .get(`/admin/emojis/${this.emojiId}`)
      .subscribe((data: any) => {
        this.emoji = data.data;
        for (const key of Object.keys(this.emoji)) {
          this.emojiForm.addControl(
            key as string,
            new FormControl(this.emoji[key])
          );
        }
      });
  }
  preventDefault(event: Event) {
    event.stopPropagation();
  }
  save() {
    this.adminService
      .updateEmoji(this.emojiId, this.emojiForm.value)
      .subscribe((data) => {
        this.close.emit();
        window.location.reload();
      });
  }
  delete() {
    this.adminService.deleteEmoji(this.emojiId).subscribe((data) => {
      this.close.emit();
      window.location.reload();
    });
  }
}
