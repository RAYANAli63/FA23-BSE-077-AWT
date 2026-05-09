import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  getRecentTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/payments/recent`);
  }
}
