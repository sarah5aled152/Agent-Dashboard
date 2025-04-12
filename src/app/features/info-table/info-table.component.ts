import { Component, Input, OnInit } from '@angular/core';
import { CustomerProfileService } from '../../services/customer/customer-profile.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { FilterOrdersPipe } from '../../filter-orders.pipe';

@Component({
  selector: 'app-info-table',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, FilterOrdersPipe],
  templateUrl: './info-table.component.html',
  styleUrls: ['./info-table.component.css'],
})
export class InfoTableComponent implements OnInit {
  @Input() userAccessToken: string = '';
  user: any = null;
  orders: any[] = [];

  isLoadingProfile = true;
  isLoadingOrders = true;

  errorProfile: string | null = null;
  errorOrders: string | null = null;

  activeTab: string = 'user-info';

  // * Pagination Variables
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(private customerProfileService: CustomerProfileService) {}

  ngOnInit(): void {
    if (this.userAccessToken) {
      this.isLoadingProfile = true;
      this.isLoadingOrders = true;
      forkJoin({
        profile: this.customerProfileService.getCustomerProfile(this.userAccessToken),
        orders: this.customerProfileService.getUserOrders(this.userAccessToken),
      }).subscribe({
        next: ({ profile, orders }) => {
          this.user = profile.user || profile;
          this.orders = orders.data || [];
          this.updatePagination();
          this.isLoadingProfile = false;
          this.isLoadingOrders = false;
        },
        error: (err) => {
          this.errorProfile = err.message || 'Failed to load customer data.';
          this.errorOrders = err.message || 'Failed to load orders.';
          this.isLoadingProfile = false;
          this.isLoadingOrders = false;
          console.error(err);
        },
      });
    } else {
      this.errorProfile = 'Invalid customer token.';
      this.isLoadingProfile = false;
      this.isLoadingOrders = false;
    }
  }

  loadCustomerData(): void {
    this.isLoadingProfile = true;
    this.customerProfileService.getCustomerProfile(this.userAccessToken).subscribe({
      next: (data) => {
        this.user = data.user || data;
        this.isLoadingProfile = false;
      },
      error: (err) => {
        this.errorProfile = err.message || 'Failed to load customer data.';
        this.isLoadingProfile = false;
        console.error(err);
      },
    });
  }

  trackByOrderId(index: number, order: any): string {
    return order._id;
  }

  // * Pagination Methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.orders.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getPaginatedOrders(orders: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return orders.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }
}