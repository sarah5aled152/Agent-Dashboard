import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerProfileService {
  constructor(private http: HttpClient) {}

  getCustomerProfile(userAccessToken: string): Observable<any> {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      return throwError(
        () => new Error('Customer ID not found. Please log in again.')
      );
    }

    const apiUrl = `https://e-commerce-api-tau-five.vercel.app/profile/${customerId}`;
    const headers = new HttpHeaders({
      accesstoken: `accesstoken_${userAccessToken}`,
    });

    return this.http.get(apiUrl, { headers }).pipe(
      catchError((error) => {
        let errorMessage = 'Failed to load profile due to an unknown error.';
        if (error.status === 401) {
          errorMessage = 'Invalid or expired access token.';
        } else if (error.status === 404) {
          errorMessage = 'Customer profile not found.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getUserOrders(userAccessToken: string): Observable<any> {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      return throwError(
        () => new Error('Customer ID not found. Please log in again.')
      );
    }

    const ordersUrl = `https://e-commerce-api-tau-five.vercel.app/order/my-orders/${customerId}`;
    const headers = new HttpHeaders({
      accesstoken: `accesstoken_${userAccessToken}`,
    });

    return this.http.get(ordersUrl, { headers }).pipe(
      catchError((error) => {
        let errorMessage = 'Failed to load orders due to an unknown error.';
        if (error.status === 401) {
          errorMessage = 'Invalid or expired access token.';
        } else if (error.status === 404) {
          errorMessage = 'No orders found for this customer.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
