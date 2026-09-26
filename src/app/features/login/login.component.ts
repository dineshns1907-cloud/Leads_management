import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Ambient warm background graphics -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>

      <div class="login-card">
        <!-- Logo & Brand Header -->
        <div class="brand-header">
          <div class="logo-box">
            <span class="logo-spark">⚡</span>
            <span class="logo-accent-dot"></span>
          </div>
          <div class="brand-titles">
            <div class="brand-name">LEAD<span class="brand-highlight">IQ</span></div>
            <div class="brand-sub">AI SALES INTEL</div>
          </div>
        </div>

        <div class="welcome-section">
          <h2 class="welcome-heading">Welcome back</h2>
          <p class="welcome-sub">Sign in to access real-time predictive lead intelligence and revenue signals.</p>
        </div>

        <!-- Error Banner -->
        <div class="error-banner" *ngIf="errorMessage()">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage() }}</span>
        </div>

        <!-- Forgot Password Notice -->
        <div class="info-banner" *ngIf="showForgotNotice()">
          <span class="info-icon">ℹ️</span>
          <div class="info-text">
            <strong>Mock Mode:</strong> In production, a secure magic reset link is dispatched. For now, use the demo credentials below or 1-click login.
          </div>
          <button class="banner-close" (click)="showForgotNotice.set(false)">✕</button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email field -->
          <div class="form-group">
            <label class="form-label" for="email">Work Email</label>
            <div class="input-wrap" [class.has-error]="emailError()">
              <span class="field-icon">✉️</span>
              <input 
                id="email" 
                name="email"
                type="email" 
                class="form-input" 
                placeholder="name@leadiq.com" 
                [(ngModel)]="email"
                (input)="clearErrors()"
                autocomplete="email"
                required
              />
            </div>
            <span class="field-error-text" *ngIf="emailError()">{{ emailError() }}</span>
          </div>

          <!-- Password field -->
          <div class="form-group">
            <div class="label-row">
              <label class="form-label" for="password">Password</label>
              <button 
                type="button" 
                class="forgot-link" 
                (click)="onForgotPassword()"
              >
                Forgot password?
              </button>
            </div>
            <div class="input-wrap" [class.has-error]="passwordError()">
              <span class="field-icon">🔒</span>
              <input 
                id="password" 
                name="password"
                [type]="showPassword() ? 'text' : 'password'" 
                class="form-input" 
                placeholder="Enter your password" 
                [(ngModel)]="password"
                (input)="clearErrors()"
                autocomplete="current-password"
                required
              />
              <button 
                type="button" 
                class="toggle-pw-btn" 
                (click)="toggleShowPassword()" 
                [title]="showPassword() ? 'Hide password' : 'Show password'"
              >
                {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span class="field-error-text" *ngIf="passwordError()">{{ passwordError() }}</span>
          </div>

          <!-- Remember Me -->
          <div class="remember-row">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="custom-checkbox" 
                name="rememberMe"
                [(ngModel)]="rememberMe"
              />
              <span>Remember this workstation</span>
            </label>
            <span class="env-tag">FastAPI Connected</span>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="submit-btn" 
            [disabled]="isLoading()"
          >
            <span class="spinner" *ngIf="isLoading()"></span>
            <span *ngIf="!isLoading()">Sign In</span>
            <span *ngIf="isLoading()">Authenticating...</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">OR</span>
          <span class="divider-line"></span>
        </div>

        <!-- Google SSO -->
        <button 
          type="button" 
          class="google-btn" 
          (click)="onGoogleLogin()" 
          [disabled]="isLoading()"
        >
          <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <!-- Quick 1-Click Demo Accounts Section -->
        <div class="demo-accounts-card">
          <div class="demo-card-title">
            <span>⚡ QUICK DEMO CREDENTIALS</span>
            <span class="demo-sub">Click to autofill & test role:</span>
          </div>

          <div class="demo-btn-grid">
            <button 
              type="button" 
              class="demo-role-btn sales-role" 
              (click)="useCredentials('salesperson@leadiq.com', 'Sales@123')"
            >
              <div class="role-icon-box">💼</div>
              <div class="role-info">
                <div class="role-name">Sales Representative</div>
                <div class="role-creds">salesperson@leadiq.com</div>
              </div>
              <span class="role-arrow">→</span>
            </button>

            <button 
              type="button" 
              class="demo-role-btn manager-role" 
              (click)="useCredentials('manager@leadiq.com', 'Manager@123')"
            >
              <div class="role-icon-box">📊</div>
              <div class="role-info">
                <div class="role-name">Sales Manager</div>
                <div class="role-creds">manager@leadiq.com</div>
              </div>
              <span class="role-arrow">→</span>
            </button>
          </div>
        </div>

        <!-- Footer security note -->
        <div class="login-footer-note">
          <span>🔒 Enterprise-grade Lead Intelligence Sandbox</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      width: 100%;
      background: var(--bg-canvas, #F7F4EE);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      position: relative;
      overflow: hidden;
    }

    /* Ambient soft background glows (Warm Terracotta & Soft Violet) */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.25;
      pointer-events: none;
    }

    .glow-1 {
      width: 460px;
      height: 460px;
      background: #E76F51;
      top: -100px;
      right: -80px;
    }

    .glow-2 {
      width: 420px;
      height: 420px;
      background: #7B61FF;
      bottom: -80px;
      left: -80px;
    }

    .login-card {
      width: 100%;
      max-width: 460px;
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 12px 36px rgba(42, 33, 24, 0.08), 0 2px 6px rgba(42, 33, 24, 0.03);
      position: relative;
      z-index: 10;
      animation: fadeIn 300ms ease-out;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo-box {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: #E76F51;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      position: relative;
      box-shadow: 0 4px 12px rgba(231, 111, 81, 0.3);
      flex-shrink: 0;
    }

    .logo-spark {
      font-size: 18px;
    }

    .logo-accent-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2A9D8F;
      border: 2px solid #FFFDF8;
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-heading, "Plus Jakarta Sans", sans-serif);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--text-primary, #202124);
      line-height: 1.1;
    }

    .brand-highlight {
      color: #E76F51;
    }

    .brand-sub {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: var(--text-secondary, #5F6368);
      margin-top: 2px;
    }

    .welcome-section {
      margin-bottom: 24px;
    }

    .welcome-heading {
      font-family: var(--font-heading, "Plus Jakarta Sans", sans-serif);
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .welcome-sub {
      font-size: 13px;
      color: var(--text-secondary, #5F6368);
      line-height: 1.5;
    }

    /* Error and Info Banners */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(231, 111, 81, 0.12);
      border: 1px solid rgba(231, 111, 81, 0.35);
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 18px;
      color: #C84B2E;
      font-size: 12.5px;
      font-weight: 500;
      animation: fadeIn 200ms ease;
    }

    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: rgba(123, 97, 255, 0.08);
      border: 1px solid rgba(123, 97, 255, 0.25);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 18px;
      color: var(--text-primary, #202124);
      font-size: 12px;
      line-height: 1.4;
      position: relative;
    }

    .banner-close {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--text-secondary, #5F6368);
      cursor: pointer;
      font-size: 12px;
    }

    /* Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .form-label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .forgot-link {
      background: none;
      border: none;
      color: #E76F51;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: none;
    }
    .forgot-link:hover {
      text-decoration: underline;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 8px;
      transition: all var(--transition-fast, 150ms ease);
    }

    .input-wrap:focus-within {
      border-color: #E76F51;
      box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.14);
    }

    .input-wrap.has-error {
      border-color: #C84B2E;
      box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.12);
    }

    .field-icon {
      position: absolute;
      left: 12px;
      font-size: 14px;
      color: var(--text-muted, #9AA0A6);
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 10px 40px 10px 36px;
      font-size: 13.5px;
      color: var(--text-primary, #202124);
      outline: none;
      font-family: inherit;
    }

    .form-input::placeholder {
      color: var(--text-muted, #9AA0A6);
    }

    .toggle-pw-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      font-size: 14px;
      color: var(--text-secondary, #5F6368);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .field-error-text {
      font-size: 11px;
      color: #C84B2E;
      font-weight: 500;
    }

    .remember-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 2px;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--text-secondary, #5F6368);
      cursor: pointer;
      user-select: none;
    }

    .custom-checkbox {
      accent-color: #E76F51;
      width: 15px;
      height: 15px;
      cursor: pointer;
    }

    .env-tag {
      font-size: 10.5px;
      font-weight: 600;
      color: #2A9D8F;
      background: rgba(42, 157, 143, 0.1);
      padding: 2px 7px;
      border-radius: 4px;
    }

    .submit-btn {
      width: 100%;
      background: #E76F51;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      padding: 11px 16px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(231, 111, 81, 0.25);
      transition: all var(--transition-fast, 150ms ease);
      margin-top: 4px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #D95D3F;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(231, 111, 81, 0.32);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 16px 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: var(--border-subtle, #E2DDD2);
    }

    .divider-text {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted, #9AA0A6);
    }

    /* Google Button */
    .google-btn {
      width: 100%;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .google-btn:hover {
      background: #FBF9F5;
      border-color: var(--border-medium, #D0C9BD);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    /* Demo Accounts Section */
    .demo-accounts-card {
      margin-top: 24px;
      padding: 16px;
      background: var(--bg-surface, #EFEAE1);
      border: 1px dashed var(--border-medium, #D0C9BD);
      border-radius: 10px;
    }

    .demo-card-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 12px;
    }

    .demo-card-title span:first-child {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-primary, #202124);
    }

    .demo-sub {
      font-size: 11px;
      color: var(--text-secondary, #5F6368);
    }

    .demo-btn-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .demo-role-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E2DDD2);
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
    }

    .demo-role-btn:hover {
      border-color: #E76F51;
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .role-icon-box {
      font-size: 16px;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--bg-surface, #EFEAE1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .role-info {
      flex: 1;
      min-width: 0;
    }

    .role-name {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      line-height: 1.2;
    }

    .role-creds {
      font-size: 11px;
      font-family: var(--font-mono, monospace);
      color: var(--text-secondary, #5F6368);
    }

    .role-arrow {
      color: #E76F51;
      font-weight: 700;
      font-size: 13px;
    }

    .login-footer-note {
      margin-top: 18px;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted, #9AA0A6);
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px 20px;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = true;
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  emailError = signal<string>('');
  passwordError = signal<string>('');
  showForgotNotice = signal<boolean>(false);

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  clearErrors(): void {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');
  }

  useCredentials(emailVal: string, pwVal: string): void {
    this.email = emailVal;
    this.password = pwVal;
    this.clearErrors();
    this.onSubmit();
  }

  onForgotPassword(): void {
    this.showForgotNotice.set(true);
  }

  async onGoogleLogin(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle();
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    this.clearErrors();

    if (!this.email.trim()) {
      this.emailError.set('Work email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.emailError.set('Please provide a valid email format');
      return;
    }

    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }

    this.isLoading.set(true);

    try {
      const res = await this.authService.login(this.email, this.password, this.rememberMe);
      if (!res.success) {
        this.errorMessage.set(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (e: any) {
      this.errorMessage.set(e?.message || 'Server connection failed. Ensure FastAPI is running.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
