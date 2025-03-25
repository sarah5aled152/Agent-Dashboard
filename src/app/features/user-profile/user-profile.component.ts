import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";


@Component({
  selector: 'app-user-profile',
  imports: [SidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

}
