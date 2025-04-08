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
// import { NavbarComponent } from './features/navbar/navbar.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  // { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'user-info/:token', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'tickets', component: TicketsPageComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingComponent, canActivate: [AuthGuard],
    children:[
      { path:'profile',component:ProfileComponent,canActivate:[AuthGuard]},
      {path:'security',component:SecurityComponent}
    ]
   },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];