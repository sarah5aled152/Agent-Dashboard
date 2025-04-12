import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private apiUrl = 'https://customer-support-rose.vercel.app/reset-password';
  constructor(private http: HttpClient) {}
  resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Observable<any> {
    const body = {
      email: email,
      otp: otp,
      newPassword: newPassword,
    };
    return this.http.post(`${this.apiUrl}`, body);
  }
}
