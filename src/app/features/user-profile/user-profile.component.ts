import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { InfoTableComponent } from "../info-table/info-table.component";


@Component({
  selector: 'app-user-profile',
  imports: [SidebarComponent, InfoTableComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

}
