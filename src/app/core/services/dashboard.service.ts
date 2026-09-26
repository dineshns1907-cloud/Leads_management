import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiDashboardResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  public readonly dashboardData = signal<ApiDashboardResponse | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  async loadDashboard(): Promise<ApiDashboardResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.get<ApiDashboardResponse>('/dashboard'));
      if (res) {
        this.dashboardData.set(res);
        return res;
      }
      return null;
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load dashboard data');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }
}
