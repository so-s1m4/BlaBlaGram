import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImgPipe } from '../../../../../../shared/utils/img.pipe';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { SvgIconComponent } from '@shared/utils/svg.component';
import { AdminService } from '@features/admin/data/admin-service';

@Component({
  selector: 'app-user-create',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    ImgPipe,
    GlassEffectDirective,
    SvgIconComponent,
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
})
export class UserCreate {
  adminService = inject(AdminService);

  @Output() readonly close = new EventEmitter<void>();
  Object = Object;
  URL = URL;

  userForm = new FormGroup<any>({
    img: new FormControl<File | null>(null),
    username: new FormControl(''),
    password: new FormControl(''),
    name: new FormControl(''),
    currency: new FormControl(0),
    role: new FormControl('user'),
    description: new FormControl(''),
  });

  constructor(private httpClient: HttpClient) {}

  preventDefault(event: Event) {
    event.stopPropagation();
  }
  uploadImg(event: any) {
    const file = event.target.files[0];
    this.userForm.patchValue({ img: file });
  }
  save() {
    this.adminService
      .createUser({
        username: this.userForm.value.username,
        password: this.userForm.value.password,
        name: this.userForm.value.name,
      })
      .subscribe((data: any) => {
        const formData = new FormData();
        for (const key of Object.keys(this.userForm.value)) {
          if (!this.userForm.value[key] || key === 'password') {
            delete this.userForm.value[key];
          } else {
            formData.append(key, this.userForm.value[key]);
          }
        }
        this.adminService
          .updateUser(data.data._id, formData)
          .subscribe((data: any) => {
            this.close.emit();
            window.location.reload();
          });
      });
  }
}
