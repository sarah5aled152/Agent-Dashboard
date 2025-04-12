import { Component, input, OnInit } from '@angular/core';
import { InfoTableComponent } from '../info-table/info-table.component';
import { ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../sidebar/agent-sidebar/agent-sidebar.component';

@Component({
  selector: 'app-user-profile',
  imports: [InfoTableComponent, AgentSidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  customerID: string = '';
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      this.customerID = params['id'];
      console.log('Customer ID:', this.customerID);
    })
  }

}
