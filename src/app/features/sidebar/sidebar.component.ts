import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone:true,
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  showAgentStatusDropdown = false;
  agentStatus: 'online' | 'offline' = 'online';
  
  constructor() { }
  
  ngOnInit(): void {
  }
  
  handleChangeAgentStatus(status: 'online' | 'offline') {
    const confirmed = confirm('Change your status to ' + status + '?');
    if (confirmed) {
      this.agentStatus = status;
      this.showAgentStatusDropdown = false;
    }
  }


}
