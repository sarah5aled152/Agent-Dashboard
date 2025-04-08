import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from "../profile/profile.component";
import { SecurityComponent } from "../security/security.component";

@Component({
  selector: 'app-setting',
  imports: [RouterModule, ProfileComponent, SecurityComponent],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent {

}
