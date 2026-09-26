import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../../models';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { ApiToken, ApiUserResponse } from '../models/api.models';
import { mapUserFromApi } from '../mappers/api-adapter';

const TOKEN_KEY = 'leadiq_access_token';
const USER_KEY = 'leadiq_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  public readonly currentUser = this._currentUser.asReadonly();

  public readonly isAuthenticated = computed(() => {
    return this._currentUser() !== null && !!this.getToken();
  });

  public readonly isSalesperson = computed(() => this._currentUser()?.role === 'salesperson');
  public readonly isManager = computed(() => this._currentUser()?.role === 'manager' || this._currentUser()?.role === 'admin');
  public readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    this.initAuth();
  }

  public getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public getCurrentUser(): User | null {
    return this._currentUser();
  }

  public hasRole(role: string): boolean {
    const userRole = this._currentUser()?.role;
    if (!userRole) return false;
    return userRole.toLowerCase() === role.toLowerCase();
  }

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public async initAuth(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this._currentUser.set(null);
      return;
    }

    try {
      const apiUser = await firstValueFrom(this.apiService.get<ApiUserResponse>('/auth/me'));
      const user = mapUserFromApi(apiUser);
      this._currentUser.set(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      // If token validation fails, clear stale session
      this.clearSession();
    }
  }

  async login(email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await firstValueFrom(
        this.apiService.post<ApiToken>('/auth/login', {
          email: normalizedEmail,
          password
        })
      );

      if (!res || !res.access_token) {
        return { success: false, error: 'Authentication failed. Invalid response from server.' };
      }

      // Store JWT token securely
      localStorage.setItem(TOKEN_KEY, res.access_token);

      // Map backend user to frontend model
      const user = mapUserFromApi(res.user);
      this._currentUser.set(user);

      if (rememberMe) {
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
          console.warn('LocalStorage save failed', e);
        }
      }

      this.toastService.show(
        'Signed In Successfully',
        `Welcome back, ${user.name}! Switched to ${user.title} workspace.`,
        'success'
      );

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || 'Authentication failed. Please verify your email and password.';
      return { success: false, error: errMsg };
    }
  }

  async loginWithGoogle(): Promise<void> {
    // Authenticate through the API using the default salesperson demo account
    await this.login('salesperson@leadiq.com', 'Sales@123', true);
  }

  logout(): void {
    // Optionally inform backend
    try {
      this.apiService.post('/auth/logout', {}).subscribe({
        error: () => {} // Non-blocking
      });
    } catch {
      // Ignore
    }

    this.clearSession();

    this.toastService.show(
      'Signed Out',
      'You have been logged out of LeadIQ Sales Intel.',
      'info'
    );

    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    this._currentUser.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('LocalStorage removal failed', e);
    }
  }

  async switchRole(role: 'salesperson' | 'manager' | 'admin'): Promise<void> {
    let email = 'salesperson@leadiq.com';
    let pw = 'Sales@123';

    if (role === 'manager') {
      email = 'manager@leadiq.com';
      pw = 'Manager@123';
    } else if (role === 'admin') {
      email = 'admin@leadiq.com';
      pw = 'Admin@123';
    }

    await this.login(email, pw, true);
  }
}
