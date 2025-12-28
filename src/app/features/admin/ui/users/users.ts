import { CommonModule, NgForOf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminService } from '@features/admin/data/admin-service';
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";
import { ImgPipe } from "@utils/img.pipe";
import { SvgIconComponent } from "@shared/utils/svg.component";
import { Modal } from "@shared/common-ui/modal/modal";
import { UserDetails } from "./ui/user-details/user-details";
import { UserCreate } from './ui/user-create/user-create';

@Component({
  selector: 'app-users',
  imports: [CommonModule, NgForOf, GlassEffectDirective, ImgPipe, SvgIconComponent, Modal, UserDetails, UserCreate],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  readonly usersData = inject(AdminService).usersData;
  Object = Object;

  userIdForDetails: string | null = null;

}
