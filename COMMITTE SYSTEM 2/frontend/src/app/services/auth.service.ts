import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  login(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
