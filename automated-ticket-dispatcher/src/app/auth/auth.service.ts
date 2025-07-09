import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private redirectUrl = '/dashboard';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(res.user);
        
        // Role-based redirection
        const userRole = res.user.role;
        let redirectTo = '/dashboard';
        
        switch (userRole) {
          case 'admin':
            redirectTo = '/admin-dashboard';
            break;
          case 'agent':
            redirectTo = '/agent-dashboard';
            break;
          case 'customer':
            redirectTo = '/dashboard';
            break;
          default:
            redirectTo = '/dashboard';
        }
        
        this.router.navigate([redirectTo]);
        this.redirectUrl = '/dashboard'; // Reset redirect URL
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.isRole('admin');
  }

  isAgent(): boolean {
    return this.isRole('agent');
  }

  isCustomer(): boolean {
    return this.isRole('customer');
  }

  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // You might want to add token validation here
  }

  private getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }
}