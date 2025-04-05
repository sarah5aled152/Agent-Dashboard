import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerProfileService {
  private apiUrl = 'https://e-commerce-api-tau-five.vercel.app/profile';
  constructor(private http: HttpClient) {}

  getCustomerProfile(userAccessToken: string): Observable<any> {
    // console.log('token being sent:', userAccessToken);
    if (!userAccessToken) {
      console.error('No access token provided');
    }
    const headers = new HttpHeaders({
      accesstoken: `accesstoken_${userAccessToken}`,
    });
    // console.log('Making request to:', this.apiUrl);
    // console.log('With headers:', headers);

    return this.http.get(this.apiUrl, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching customer profile:', error);
        throw error;
      })
    );
  }
}
