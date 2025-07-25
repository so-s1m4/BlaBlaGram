import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth-guard.module';
import { LayoutComponent } from '../common-ui/layout/layout.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { CreatePostMobileComponent } from './pages/create-post-mobile/create-post-mobile.component';
import { MobileGuard } from './guards/mobile-guard.module';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'home',
        redirectTo: '',
      },
      {
        path: 'chats',
        component: ChatsComponent,
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
      {
        path: 'create-post',
        component: CreatePostMobileComponent,
        canActivate: [MobileGuard],
      },
    ],
  },
];
