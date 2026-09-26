import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-login-page">
      <div class="admin-login-card animate-fade-in">
        
        <!-- Brand Header -->
        <div class="brand-block">
          <div class="brand-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">LEADIQ</span>
          </div>
          <div class="ai-intel-sub">AI SALES INTELLIGENCE</div>
          <div class="portal-badge">ADMIN PORTAL</div>
        </div>

        <p class="admin-instruction">
          Administrative gateway for user provisioning, sales territory management, and platform security.
        </p>

        <!-- Error Alert -->
        <div class="error-banner animate-fade-in" *ngIf="errorMessage">
          <span>⚠️</span> {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Admin Email</label>
            <div class="input-wrap">
              <span class="input-icon">✉️</span>
              <input 
                type="email" 
                class="input" 
                placeholder="admin@leadiq.com" 
                [(ngModel)]="email" 
                name="email" 
                required 
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrap">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                class="input" 
                placeholder="••••••••••••" 
                [(ngModel)]="password" 
                name="password" 
                required 
                autocomplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary submit-btn" 
            [disabled]="isLoading || !email || !password"
          >
            <span *ngIf="!isLoading">LOGIN TO ADMIN PORTAL</span>
            <span *ngIf="isLoading">AUTHENTICATING...</span>
          </button>
        </form>

        <div class="card-footer">
          <div class="security-note">
            <span>🛡️</span> <strong>Admin access only</strong> • All access attempts are cryptographically audited.
          </div>
          <div class="switch-link">
            <a routerLink="/login" class="rep-login-link">Switch to Sales Representative Login →</a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111827; /* Dark slate background distinguishing admin from rep */
      padding: 20px;
    }

    .admin-login-card {
      background: #1F2937;
      border: 1px solid #374151;
      border-radius: 16px;
      padding: 40px 36px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .brand-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-bottom: 18px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-icon {
      font-size: 26px;
      color: #F46036;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.03em;
    }

    .ai-intel-sub {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #9CA3AF;
    }

    .portal-badge {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      background: rgba(244, 96, 54, 0.2);
      color: #F46036;
      border: 1px solid rgba(244, 96, 54, 0.4);
      padding: 3px 12px;
      border-radius: 999px;
      margin-top: 6px;
    }

    .admin-instruction {
      font-size: 12.5px;
      color: #9CA3AF;
      text-align: center;
      line-height: 1.45;
      margin-bottom: 24px;
    }

    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #EF4444;
      color: #FCA5A5;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #D1D5DB;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      font-size: 14px;
      color: #9CA3AF;
      pointer-events: none;
    }

    .input {
      width: 100%;
      background: #111827;
      border: 1px solid #374151;
      color: #FFFFFF;
      padding: 11px 12px 11px 36px;
      border-radius: 8px;
      font-size: 13.5px;
      transition: all 0.15s ease;
    }
    .input:focus {
      outline: none;
      border-color: #F46036;
      box-shadow: 0 0 0 3px rgba(244, 96, 54, 0.2);
    }

    .submit-btn {
      margin-top: 8px;
      padding: 12px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      background: #F46036;
      border-color: #E0532B;
      color: #FFFFFF;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .submit-btn:hover:not(:disabled) {
      background: #E0532B;
      transform: translateY(-1px);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .card-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #374151;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .security-note {
      font-size: 11px;
      color: #6B7280;
      text-align: center;
    }

    .rep-login-link {
      font-size: 12px;
      color: #9CA3AF;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .rep-login-link:hover {
      color: #F46036;
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = 'admin@leadiq.com';
  password = '';
  isLoading = false;
  errorMessage = '';

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    const res = await this.authService.login(this.email, this.password);
    this.isLoading = false;

    if (!res.success) {
      this.errorMessage = res.error || 'Invalid credentials.';
      return;
    }

    // Role verification: Must be ADMIN role
    const currentUser = this.authService.currentUser();
    if (currentUser?.role !== 'admin') {
      // Clear unauthorized session
      this.authService.logout();
      this.errorMessage = 'Access Denied: Only Administrator accounts can log in here. Please use the Sales Representative login.';
      return;
    }

    this.toastService.success('Welcome back, System Administrator!');
    this.router.navigate(['/admin/dashboard']);
  }
}
