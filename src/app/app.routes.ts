import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
// import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/auth.guard';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { ChatComponent } from './features/chat/chat.component';
import { TicketsPageComponent } from './features/tickets-page/tickets-page.component';
import { SettingComponent } from './features/settings/setting/setting.component';
import { ProfileComponent } from './features/settings/profile/profile.component';
import { SecurityComponent } from './features/settings/security/security.component';
import { LayoutComponent } from './layout/layout/layout.component';
// import { NavbarComponent } from './features/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default child route
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'user-info/:token',
        component: UserProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'tickets',
        component: TicketsPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'settings',
        component: SettingComponent,
        canActivate: [AuthGuard],
      },
      { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
    ],
  },
  { path: '**', redirectTo: '' }, // Moved wildcard route to the root level
];
