import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerProfileService } from '../../services/customer/customer-profile.service';

@Component({
  selector: 'app-clientsidebar',
  standalone:true,
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './clientsidebar.component.html',
  styleUrl: './clientsidebar.component.css'
})
export class ClientSidebarComponent implements OnInit {
  @Input() userAccessToken: string = '';
  user: any = {};
  isLoading = true;
  error: string | null = null;
  showAgentStatusDropdown = false;
  agentStatus: 'online' | 'offline' = 'online';
  
  constructor(private customerProfileService: CustomerProfileService,) { 
    
  }
  
  ngOnInit(): void {
    if (this.userAccessToken) {
      this.loadCustomerData();
    } else {
      this.error = 'Invalid customer token.';
      this.isLoading = false;
    }
  }
  loadCustomerData(): void {
    this.customerProfileService.getCustomerProfile(this.userAccessToken).subscribe({
      next: (data) => {
        console.log('Customer data:', data);
        this.user = data.user;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load customer data.';
        this.isLoading = false;
        console.error('full error',err);
        
      },
    });
  }
  handleChangeAgentStatus(status: 'online' | 'offline') {
    const confirmed = confirm('Change your status to ' + status + '?');
    if (confirmed) {
      this.agentStatus = status;
      this.showAgentStatusDropdown = false;
    }
  }


}
