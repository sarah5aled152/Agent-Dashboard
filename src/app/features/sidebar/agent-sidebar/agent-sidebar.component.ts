import { AuthService } from './../../../core/auth.service';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agent-sidebar',
  imports: [RouterLink,RouterModule],
  templateUrl: './agent-sidebar.component.html',
  styleUrl: './agent-sidebar.component.css'
})
export class AgentSidebarComponent {
  constructor(private authService:AuthService){}
  logout(){
    this.authService.logout();
  }

}
