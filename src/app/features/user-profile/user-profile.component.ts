import { Component, input } from '@angular/core';
import { InfoTableComponent } from '../info-table/info-table.component';
import { ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../sidebar/agent-sidebar/agent-sidebar.component';

@Component({
  selector: 'app-user-profile',
  imports: [InfoTableComponent, AgentSidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  token: string = '';
  constructor(private route: ActivatedRoute) {
    // this.token =  this.route.snapshot.paramMap.get('token')|| ''
    // console.log('Token from route:', this.token);
    this.route.paramMap.subscribe((params) => {
      this.token = params.get('token') || '';
      // localStorage.setItem('userAccessToken', this.token);
    });
  }
}
