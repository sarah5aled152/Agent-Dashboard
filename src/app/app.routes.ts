import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { AuthGuard } from './core/auth.guard';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { ChatComponent } from './features/chat/chat.component';
import { TicketsPageComponent } from './features/tickets-page/tickets-page.component';
import { SettingComponent } from './features/settings/setting/setting.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { ProfileComponent } from './features/settings/profile/profile.component'; // Added missing import
import { SecurityComponent } from './features/settings/security/security.component'; // Added missing import

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes inside layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'user-info/:token',
        component: UserProfileComponent,
      },
      {
        path: 'tickets',
        component: TicketsPageComponent,
      },
      {
        path: 'settings',
        component: SettingComponent,
      },
      {
        path: 'chat',
        component: ChatComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
