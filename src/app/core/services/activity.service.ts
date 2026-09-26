import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiActivityResponse } from '../models/api.models';
import { mapActivityFromApi } from '../mappers/api-adapter';
import { Activity } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private api = inject(ApiService);

  public readonly activities = signal<Activity[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  async loadActivities(limit = 100): Promise<Activity[]> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.get<ApiActivityResponse[]>('/activities', { limit }));
      const mapped = (res || []).map(mapActivityFromApi);
      this.activities.set(mapped);
      return mapped;
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load activities');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async logLeadActivity(leadId: string, activityType: string, description: string, metadata?: any): Promise<Activity | null> {
    try {
      const payload: any = {
        activity_type: activityType,
        description
      };
      if (metadata) {
        payload.activity_metadata = metadata;
      }
      const res = await firstValueFrom(this.api.post<ApiActivityResponse>(`/leads/${leadId}/activities`, payload));
      const mapped = mapActivityFromApi(res);
      this.activities.update(acts => [mapped, ...acts]);
      return mapped;
    } catch (err) {
      console.warn(`Failed to log activity for lead ${leadId}:`, err);
      return null;
    }
  }
}
