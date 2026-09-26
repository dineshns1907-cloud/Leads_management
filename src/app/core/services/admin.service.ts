import { Injectable, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { ApiAdminDashboard } from '../models/api.models';

export interface CreateSalespersonDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  status: string;
  is_active: boolean;
  assigned_leads: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  private readonly _dashboard = signal<ApiAdminDashboard | null>(null);
  public readonly dashboard = this._dashboard.asReadonly();

  private readonly _users = signal<AdminUserItem[]>([]);
  public readonly users = this._users.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  public readonly isLoading = this._isLoading.asReadonly();

  async loadDashboard(): Promise<void> {
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(this.apiService.get<ApiAdminDashboard>('/admin/dashboard'));
      this._dashboard.set(data);
      if (data && data.sales_team) {
        this._users.set(data.sales_team);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      this.toastService.error(err?.message || 'Failed to load Admin Dashboard data.');
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await firstValueFrom(this.apiService.get<AdminUserItem[]>('/admin/users'));
      this._users.set(users || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  }

  async createSalesperson(dto: CreateSalespersonDto): Promise<boolean> {
    try {
      await firstValueFrom(this.apiService.post('/admin/users', {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        password: dto.password,
        role: dto.role || 'SALES_REPRESENTATIVE',
        department: dto.department || 'Commercial & Mid-Market Accounts',
        is_active: dto.is_active !== undefined ? dto.is_active : true
      }));

      this.toastService.success('Salesperson account created successfully.');
      await this.loadDashboard();
      return true;
    } catch (err: any) {
      this.toastService.error(err?.message || 'Failed to create salesperson account.');
      return false;
    }
  }

  async toggleStatus(userId: string, currentActive: boolean): Promise<boolean> {
    try {
      await firstValueFrom(this.apiService.patch(`/admin/users/${userId}/status`, {
        is_active: !currentActive
      }));

      const action = !currentActive ? 'activated' : 'deactivated';
      this.toastService.success(`User ${action} successfully.`);
      await this.loadDashboard();
      return true;
    } catch (err: any) {
      this.toastService.error(err?.message || 'Failed to update user status.');
      return false;
    }
  }
}
