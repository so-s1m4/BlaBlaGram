import { DatePipe, DecimalPipe, NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { ImgPipe } from '@utils/img.pipe';
import { SvgIconComponent } from '@utils/svg.component';

@Component({
  selector: 'app-user-details',
  imports: [
    DatePipe,
    ImgPipe,
    DecimalPipe,
    GlassEffectDirective,
    ReactiveFormsModule,
    SvgIconComponent,
    FormsModule,
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit {
  adminService = inject(AdminService);

  @Input() userId!: string;
  @Output() readonly close = new EventEmitter<void>();
  Object = Object;
  URL = URL;

  userForm = new FormGroup<any>({});

  constructor(private httpClient: HttpClient) {}
  user: any = null;

  ngOnInit() {
    this.httpClient
      .get(`/admin/users/${this.userId}`)
      .subscribe((data: any) => {
        console.log(data.data);
        this.user = data.data;
        for (const key of Object.keys(this.user)) {
          this.userForm.addControl(
            key as string,
            new FormControl(this.user[key])
          );
        }
        this.userForm.addControl('password', new FormControl(''));
        this.userForm.addControl('description', new FormControl(''));
      });
  }
  preventDefault(event: Event) {
    event.stopPropagation();
  }
  uploadImg(event: any) {
    const file = event.target.files[0];
    this.userForm.patchValue({ img: file });
  }
  save() {
    const formData = new FormData();
    for (const key of Object.keys(this.userForm.value)) {
      if (!this.userForm.value[key] && this.userForm.value[key] !== 0) {
        delete this.userForm.value[key];
      } else {
        formData.append(key, this.userForm.value[key]);
      }
    }

    this.adminService.updateUser(this.userId, this.userForm.value).subscribe((data) => {
      this.close.emit();
      window.location.reload();
    });
  }
  delete() {
    this.httpClient.delete(`/admin/users/${this.userId}`).subscribe((data) => {
      this.close.emit();
      window.location.reload();
    });
  }
}
