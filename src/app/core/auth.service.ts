import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  exp: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
 
  private readonly apiBaseUrl = 'http://localhost:3000'; 

 
  private readonly tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  readonly token$ = this.tokenSubject.asObservable();

 
  constructor(private http: HttpClient, private router: Router) {}


  private setToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem('token', token);

    const decoded = jwtDecode<JwtPayload>(token);
    console.log(decoded);
    localStorage.setItem('userId', decoded.id);
    localStorage.setItem('userEmail', decoded['userEmail']);
  }

  private clearToken(): void {
    this.tokenSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isLoggedIn(): boolean {
    const t = this.token;
    if (!t) return false;

    try {
      const { exp } = jwtDecode<JwtPayload>(t);
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }


  login(email: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>(`${this.apiBaseUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => this.setToken(res.token)),
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  register(
    name: string,
    email: string,
    password: string,
    confirmedPassword: string
  ): Observable<void> {
    return this.http
      .post<{ token: string }>(`${this.apiBaseUrl}/auth/register`, {
        name,
        email,
        password,
        confirmedPassword,
      })
      .pipe(
        tap((res) => this.setToken(res.token)),
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return new Observable<void>(observer => {
      try {
        this.clearToken();
        this.router.navigateByUrl('/').then(
          () => observer.complete(),
          error => observer.error(error)
        );
      } catch (error) {
        observer.error(error);
      }
    }).pipe(
      finalize(() => {
        // Ensure cleanup happens even if navigation fails
        this.tokenSubject.next(null);
      })
    );
  }


  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status}\nMessage: ${error.message}`;
      
      // Handle specific HTTP status codes
      switch (error.status) {
        case 401:
          this.clearToken();
          this.router.navigateByUrl('/login');
          errorMessage = 'Session expired. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied. Insufficient permissions.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }

    console.error('[AuthService]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };
}
