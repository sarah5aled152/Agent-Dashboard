import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgentStatusService {
  private readonly baseUrl = 'http://localhost:3000';

  private statusSubject = new BehaviorSubject<'available' | 'away' | 'busy'>(
    'away'
  );
  status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getStatus(): Observable<{ status: 'available' | 'away' | 'busy' }> {
    return this.http
      .get<{ status: 'available' | 'away' | 'busy' }>(
        `${this.baseUrl}/profile`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(tap((res) => this.statusSubject.next(res.status)));
  }

  updateStatus(newStatus: 'available' | 'away' | 'busy'): Observable<any> {
    return this.http
      .put<any>(
        `${this.baseUrl}/profile/agent/${newStatus}`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(tap(() => this.statusSubject.next(newStatus)));
  }

  refreshStatusFromServer(): void {
    this.getStatus().subscribe();
  }
}
