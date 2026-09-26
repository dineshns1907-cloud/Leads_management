import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiRecommendationResponse } from '../models/api.models';
import { mapRecommendationFromApi } from '../mappers/api-adapter';
import { Recommendation } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private api = inject(ApiService);

  public readonly recommendations = signal<Recommendation[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  async loadRecommendations(category?: string, priority?: string): Promise<Recommendation[]> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const params: Record<string, any> = {};
      if (category && category !== 'all') params['category'] = category;
      if (priority && priority !== 'all') params['priority'] = priority;

      const res = await firstValueFrom(this.api.get<ApiRecommendationResponse[]>('/recommendations', params));
      const mapped = (res || []).map(mapRecommendationFromApi);
      this.recommendations.set(mapped);
      return mapped;
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load recommendations');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async completeRecommendation(recId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.put<{ status: string }>(`/recommendations/${recId}/complete`, {}));
      this.recommendations.update(recs =>
        recs.map(r => r.id === recId ? { ...r, completed: true } : r)
      );
      return true;
    } catch (err) {
      console.warn(`Failed to mark recommendation ${recId} complete:`, err);
      // Optimistic update
      this.recommendations.update(recs =>
        recs.map(r => r.id === recId ? { ...r, completed: true } : r)
      );
      return false;
    }
  }
}
