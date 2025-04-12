import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable, throwError } from 'rxjs';

interface Order{
  _id: string;
  orderItems:{
    title: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  shippingAddress:{
    city: string;
    address: string;
    postalCode: string;
    country: string;
  }
  phoneNumbers:string[]
  totalPrice: number;
  createdAt: string;

}
interface OrdersResponse{
  message: string;
  success: boolean;
  data: Order[];
}
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'https://e-commerce-api-tau-five.vercel.app/order/my-orders'

  constructor(private http : HttpClient) { }
  getUserOrdersById(id:string): Observable<OrdersResponse>{
    // const userAccessToken = localStorage.getItem('accesstoken') || ''
    if (!id) {
      console.error('No id provided');
    }
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<OrdersResponse>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching user orders:', error);
        const errorMessage = error.error?.message || error.statusText || 'Unknown error';
        return throwError(() => new Error(`Failed to fetch user orders: ${errorMessage}`));
      })
    );
  }
}
