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
export class SidebarComponent implements OnInit {
  agentStatus: string = 'offline';
  
  constructor() { }
  
  ngOnInit(): void {
  }
  
  toggleStatus() {
    this.agentStatus = this.agentStatus === 'online' ? 'offline' : 'online';
  }
}
