import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-gift-details',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, GlassEffectDirective, SvgIconComponent],
  templateUrl: './gift-details.html',
  styleUrl: './gift-details.css',
})
export class GiftDetails {
  @Input() giftId!: string;
  @Output() readonly close = new EventEmitter<void>();

  adminService = inject(AdminService);

  Object = Object;
  URL = URL;

  giftForm = new FormGroup<any>({});

  constructor(private httpClient: HttpClient) {}
  gift: any = null;

  ngOnInit() {
    this.httpClient
      .get(`/admin/gifts/${this.giftId}`)
      .subscribe((data: any) => {
        this.gift = data.data;
        for (const key of Object.keys(this.gift)) {
          this.giftForm.addControl(
            key as string,
            new FormControl(this.gift[key])
          );
        }
      });
  }
  preventDefault(event: Event) {
    event.stopPropagation();
  }
  save() {
    this.adminService
      .updateGift(this.giftId, this.giftForm.value)
      .subscribe((data) => {
        this.close.emit();
        window.location.reload();
      });
  }
  delete() {
    this.adminService.deleteGift(this.giftId).subscribe((data) => {
      this.close.emit();
      window.location.reload();
    });
  }
}
