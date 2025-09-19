import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { GlassEffectDirective } from '@shared/common-ui/glass-wrapper-component/glass-wrapper-component';
import { AdminService } from './data/admin-service';
import { Users } from './ui/users/users';
import { Gifts } from './ui/gifts/gifts';
import { Emojis } from './ui/emojis/emojis';
import { Messages } from './ui/messages/messages';
import { Posts } from './ui/posts/posts';
import { Logs } from './ui/logs/logs';

@Component({
  selector: 'app-admin-component',
  imports: [FormsModule, GlassEffectDirective, Users, Gifts, Emojis, Messages, Posts, Logs],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {

  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);


  selectedAction: string = "users";

  ngOnInit(): void {
    if (this.authService.me.role !== 'admin') {
      this.router.navigate(['/']);
      throw new Error('Access denied. Admins only.');
    }
  }
}
