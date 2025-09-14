import { Routes } from '@angular/router';
import { LoginPage } from '@features/login/login.component';
import { AuthGuard } from '@core/guards/auth-guard.module';
import { LayoutComponent } from '@features/layout/layout.component';
import { ChatsComponent } from '@features/chats/chats.component';
import { FriendsComponent } from '@features/friends/friends.component';
import { RegisterPage } from '@features/register/register.component';
import { ChatComponent } from '@features/chats/ui/chat/chat.component';
import { CreateComponent } from '@features/chats/ui/create-component/create-component';

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
        redirectTo: 'chats',
        pathMatch: 'full',
      },
      {
        path: 'chats',
        component: ChatsComponent,
        children: [
          {
            path: ':chatId',
            component: ChatComponent,
          },
          {
            path: 'create/:type',
            component: CreateComponent,
          },
        ],
      },
      {
        path: 'friends',
        component: FriendsComponent,
      },
    ],
  },
];
