import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerProfileService {
  private apiUrl = 'https://e-commerce-api-tau-five.vercel.app/profile';
  constructor(private http: HttpClient) {}

  getCustomerProfileById(id: string): Observable<any> {
    // console.log('token being sent:', userAccessToken);
    if (!id) {
      console.error('No id provided');
    }
  const url = `${this.apiUrl}/${id}`;
    // console.log('Making request to:', this.apiUrl);
    // console.log('With headers:', headers);

    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Error fetching customer profile:', error);
        throw error;
      })
    );
  }
}
