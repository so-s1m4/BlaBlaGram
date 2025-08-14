import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from '@features/login/login.component';
import { HomeComponent } from '@features/home/home.component';
import { AuthGuard } from '@core/guards/auth-guard.module';
import { LayoutComponent } from '@features/layout/layout.component';
import { ChatsComponent } from '@features/chats/chats.component';
import { FriendsComponent } from '@features/friends/friends.component';
import { MobileGuard } from '@core/guards/mobile-guard.module';
import { RegisterPage } from '@features/register/register.component';
import { ProfileComponent } from '@features/profile/profile.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'register',
    component: RegisterPage,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ChatsComponent,
      },
      {
        path: 'chats',
        redirectTo: ""
      },
      {
        path: 'friends',
        component: FriendsComponent,
      },
      {
        path: 'profile',
        redirectTo: 'profile/me',
      },
      {
        path: 'profile/:username',
        component: ProfileComponent,
      },
    ],
  },
];
