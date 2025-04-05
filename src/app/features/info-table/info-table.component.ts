import { Component,  Input,  OnInit } from '@angular/core';
import { CustomerProfileService } from '../../services/customer/customer-profile.service';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../services/customer/orders.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-info-table',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './info-table.component.html',
  styleUrl: './info-table.component.css',
})
export class InfoTableComponent implements OnInit {
  @Input() userAccessToken: string = '';
  user: any = {};
  isLoading = true;
  error: string | null = null;
  activeTab: string = 'user-info';
  orders:any[] = [];
  constructor(
    private customerProfileService: CustomerProfileService,
    private orderService: OrdersService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    // this.userAccessToken = this.route.snapshot.paramMap.get('token') || '';
    // console.log('Token from route:', this.userAccessToken);
    if (this.userAccessToken) {
      this.loadCustomerData();
    } else {
      this.error = 'Invalid customer token.';
      this.isLoading = false;
    }
    this.loadOrders()
  }
  loadCustomerData(): void {
    this.customerProfileService.getCustomerProfile(this.userAccessToken).subscribe({
      next: (data) => {
        console.log('Customer data:', data);
        this.user = data.user;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to loading customer data.';
        this.isLoading = false;
        console.error('full error',err);
        
      },
    });
  }
  loadOrders(): void {
    this.orderService.getUserOrders(this.userAccessToken).subscribe({
      next: (response)=>{
        console.log('User orders:', response);
        this.orders = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
        console.error('full error',err);
      }
    })
  }
}
