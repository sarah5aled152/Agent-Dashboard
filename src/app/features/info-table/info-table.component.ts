import { Component,  Input,  OnInit } from '@angular/core';
import { CustomerProfileService } from '../../services/customer/customer-profile.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-table',
  imports: [],
  templateUrl: './info-table.component.html',
  styleUrl: './info-table.component.css',
})
export class InfoTableComponent implements OnInit {
  @Input() userAccessToken: string = '';
  user: any = {};
  isLoading = true;
  error: string | null = null;
  activeTab: string = 'user-info';
  orders = [
    { date: 'may 20th 2025', orderId: 10, customer: 'Customer' },
    { date: 'apr 20th 2025', orderId: 11, customer: 'Customer' },
    { date: 'jun 20th 2025', orderId: 12, customer: 'Customer' },
  ];
  constructor(
    private customerProfileService: CustomerProfileService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.userAccessToken = this.route.snapshot.paramMap.get('token') || '';
    console.log('Token from route:', this.userAccessToken);
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
        this.error = 'Faild to loading customer data.';
        this.isLoading = false;
        console.error('full error',err);
        
      },
    });
  }
}
