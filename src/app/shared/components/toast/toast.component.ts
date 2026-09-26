import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toasts().length > 0">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="toast-card"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'ai'">⚡</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-body">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Close notification">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      width: 100%;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
      background: #FFFDF8;
      border: 1px solid #DDD8CE;
      box-shadow: 0 4px 20px rgba(32, 33, 36, 0.1), 0 1px 3px rgba(32, 33, 36, 0.06);
      animation: slideIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-icon {
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      flex-shrink: 0;
      font-weight: 700;
    }

    .toast-success {
      border-left: 3px solid #2A9D8F;
    }
    .toast-success .toast-icon {
      background: rgba(42, 157, 143, 0.12);
      color: #228276;
    }

    .toast-ai {
      border-left: 3px solid #7B61FF;
      background: #FDFCFA;
    }
    .toast-ai .toast-icon {
      background: rgba(123, 97, 255, 0.12);
      color: #5B40E8;
    }

    .toast-warning {
      border-left: 3px solid #E9A23B;
    }
    .toast-warning .toast-icon {
      background: rgba(233, 162, 59, 0.12);
      color: #B57417;
    }

    .toast-info {
      border-left: 3px solid #E76F51;
    }
    .toast-info .toast-icon {
      background: rgba(231, 111, 81, 0.12);
      color: #C84B2E;
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-size: 13px;
      font-weight: 700;
      color: #202124;
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 12px;
      color: #6B6B66;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #8C8C85;
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    .toast-close:hover {
      color: #202124;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
