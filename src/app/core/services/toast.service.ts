import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'ai';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  show(title: string, message: string, type: 'success' | 'info' | 'warning' | 'ai' = 'info', durationMs: number = 4000): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      title,
      message,
      type,
      timestamp: new Date()
    };

    this._toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(message: string, title = 'Success', durationMs = 4000): void {
    this.show(title, message, 'success', durationMs);
  }

  error(message: string, title = 'Error', durationMs = 5000): void {
    this.show(title, message, 'warning', durationMs);
  }

  info(message: string, title = 'Info', durationMs = 4000): void {
    this.show(title, message, 'info', durationMs);
  }

  dismiss(id: string): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }
}
